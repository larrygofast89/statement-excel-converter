import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import OpenAI from "openai";
import * as mupdf from "mupdf";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

// 未登录用户每日可转换页数
const GUEST_DAILY_PAGE_LIMIT = 1;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL:
    process.env.OPENAI_BASE_URL ||
    "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

// 首页 prompt：提取账户头信息 + 摘要(summary) + 交易
const HEADER_PROMPT = `You are a precise bank statement parser. Extract data from this page of a bank statement. Return ONLY valid JSON:
{"bankName":null,"accountName":null,"accountNumber":null,"currency":null,"statementPeriod":null,"summary":[{"label":"","value":""}],"transactions":[{"date":"YYYY-MM-DD","description":"","amount":0}]}

Rules:
1. Account header: bank name, account holder name, account number, currency, statement period — only if visible on THIS page.
2. summary: capture EVERY figure in any account-summary box on this page (e.g. Beginning Balance, Ending Balance, Total Deposits, Total Withdrawals, Average Balance, Service Charges, Interest, Fees Paid). Use one label/value pair per figure, keep the original wording. If there is no summary box, return an empty array [].
3. transactions: EVERY transaction row with date, description, amount. amount negative for debits/withdrawals, positive for credits/deposits.
4. null for missing header fields, [] for missing arrays. Never invent data.
5. Return only JSON, no markdown.`;

// 后续页 prompt：只提取交易
const TRANSACTIONS_PROMPT = `You are a precise bank statement parser. Extract ONLY the transaction rows from this page of a bank statement. Return ONLY valid JSON:
{"transactions":[{"date":"YYYY-MM-DD","description":"","amount":0}]}

Rules:
1. Extract EVERY transaction row: date, description, amount.
2. amount negative for debits/withdrawals, positive for credits/deposits.
3. Return only JSON, no markdown.`;

type Image = { base64: string; mimeType: string };

type Extracted = {
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  currency?: string | null;
  statementPeriod?: string | null;
  summary?: { label: string; value: string }[];
  transactions?: { date: string; description: string; amount: number | null }[];
};

function renderFileToImages(bytes: Uint8Array, type: string, name: string): Image[] {
  if (type.startsWith("image/")) {
    return [{ base64: Buffer.from(bytes).toString("base64"), mimeType: type }];
  }

  if (type === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
    const doc = mupdf.Document.openDocument(bytes, "application/pdf");
    const pageCount = Math.min(doc.countPages(), 10);
    const images: Image[] = [];
    for (let i = 0; i < pageCount; i++) {
      const page = doc.loadPage(i);
      const pixmap = page.toPixmap(
        mupdf.Matrix.scale(1.5, 1.5),
        mupdf.ColorSpace.DeviceGray
      );
      const png = pixmap.asPNG();
      images.push({
        base64: Buffer.from(png).toString("base64"),
        mimeType: "image/png",
      });
      pixmap.destroy();
      page.destroy();
    }
    return images;
  }

  throw new Error(`Unsupported file type: ${name}. Please upload a PDF or image.`);
}

function parseJson(content: string): Extracted {
  try {
    return JSON.parse(content);
  } catch {
    return JSON.parse(content.replace(/```json|```/g, "").trim());
  }
}

// 简单并发池
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const i = cursor++;
      results[i] = await tasks[i]();
    }
  });
  await Promise.all(workers);
  return results;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("file") as File[];
  const mode = (formData.get("mode") as string) || "separate";

  if (!files.length) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1) 渲染所有文件为图片页
  const rendered: { name: string; pages: Image[] }[] = [];
  for (const f of files) {
    const bytes = new Uint8Array(await f.arrayBuffer());
    rendered.push({ name: f.name, pages: renderFileToImages(bytes, f.type, f.name) });
  }
  const totalPages = rendered.reduce((n, f) => n + f.pages.length, 0);

  // 2) 身份识别 + 未登录每日限制检查
  const cookieStore = cookies();
  const supabase = createServerSupabase({
    getAll: () => cookieStore.getAll(),
    set: (name, value, options) => cookieStore.set(name, value, options),
  });

  let identity: string;
  let isGuest = false;
  if (supabase && isSupabaseConfigured()) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      identity = user.id;
    } else {
      let deviceId = cookieStore.get("device_id")?.value;
      if (!deviceId) {
        deviceId = randomUUID();
        cookieStore.set("device_id", deviceId, {
          maxAge: 31536000,
          httpOnly: true,
          path: "/",
          sameSite: "lax",
        });
      }
      identity = `guest:${deviceId}`;
      isGuest = true;
    }
  } else {
    // Supabase 未配置：开发/降级模式放行
    identity = "unconfigured";
    isGuest = false;
  }

  if (isGuest) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase!
      .from("conversion_limits")
      .select("page_count")
      .eq("identity", identity)
      .eq("usage_date", today)
      .maybeSingle();
    const used = existing?.page_count ?? 0;
    if (used + totalPages > GUEST_DAILY_PAGE_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "LIMIT_REACHED",
          message:
            "Free users can convert 1 page per day. Sign in to convert more.",
          remaining: Math.max(0, GUEST_DAILY_PAGE_LIMIT - used),
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const encoder = new TextEncoder();

  // 2) SSE 流式返回
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (obj: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch {
          // 客户端已断开，停止后续推送
          closed = true;
        }
      };

      const pageResults: (Extracted | null)[] = [];

      try {
        const totalPages = rendered.reduce((n, f) => n + f.pages.length, 0);
        send({ type: "start", totalPages });

        // 每个页一个 task，LLM 流式生成，delta 实时转发
        const tasks: (() => Promise<Extracted>)[] = [];
        const meta: { fileIdx: number; pageIdx: number }[] = [];
        rendered.forEach((file, fileIdx) => {
          file.pages.forEach((page, pageIdx) => {
            const isHeader = pageIdx === 0;
            tasks.push(async () => {
              const completion = await client.chat.completions.create({
                model: process.env.OPENAI_MODEL || "qwen3.7-plus",
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: isHeader ? HEADER_PROMPT : TRANSACTIONS_PROMPT,
                      },
                      {
                        type: "image_url" as const,
                        image_url: {
                          url: `data:${page.mimeType};base64,${page.base64}`,
                        },
                      },
                    ],
                  },
                ],
                response_format: { type: "json_object" },
                temperature: 0,
                max_tokens: 4000,
                stream: true,
              });

              let full = "";
              for await (const chunk of completion) {
                const delta = chunk.choices?.[0]?.delta?.content || "";
                if (delta) {
                  full += delta;
                  send({ type: "delta", fileIdx, pageIdx, text: delta });
                  if (closed) break; // 客户端断开，停止生成
                }
              }

              if (closed) return {} as Extracted; // 客户端断开，跳过后续
              const parsed = parseJson(full);
              send({ type: "page_done", fileIdx, pageIdx, result: parsed });
              return parsed;
            });
            meta.push({ fileIdx, pageIdx });
          });
        });

        const results = await runWithConcurrency(tasks, 4);
        pageResults.push(...results);

        // 3) 归并各文件各页
        const perFile: Extracted[] = rendered.map(() => ({
          summary: [],
          transactions: [],
        }));
        results.forEach((page, i) => {
          const { fileIdx } = meta[i];
          const target = perFile[fileIdx];
          if (!target.bankName && page.bankName) target.bankName = page.bankName;
          if (!target.accountName && page.accountName) target.accountName = page.accountName;
          if (!target.accountNumber && page.accountNumber) target.accountNumber = page.accountNumber;
          if (!target.currency && page.currency) target.currency = page.currency;
          if (!target.statementPeriod && page.statementPeriod) target.statementPeriod = page.statementPeriod;
          if (page.summary?.length) target.summary!.push(...page.summary);
          if (page.transactions?.length) target.transactions!.push(...page.transactions);
        });

        // 4) 模式处理
        if (mode === "merge") {
          const merged: Extracted = { summary: [], transactions: [] };
          for (const f of perFile) {
            if (!merged.bankName && f.bankName) merged.bankName = f.bankName;
            if (!merged.accountName && f.accountName) merged.accountName = f.accountName;
            if (!merged.accountNumber && f.accountNumber) merged.accountNumber = f.accountNumber;
            if (!merged.currency && f.currency) merged.currency = f.currency;
            if (!merged.statementPeriod && f.statementPeriod) merged.statementPeriod = f.statementPeriod;
            if (f.summary?.length) merged.summary!.push(...f.summary);
            if (f.transactions?.length) merged.transactions!.push(...f.transactions);
          }
          send({ type: "done", results: [merged] });
        } else {
          send({ type: "done", results: perFile });
        }

        // 3) 记录用量（转换成功后累加页数）
        if (supabase && identity !== "unconfigured") {
          try {
            const today = new Date().toISOString().slice(0, 10);
            const { data: existing } = await supabase
              .from("conversion_limits")
              .select("page_count")
              .eq("identity", identity)
              .eq("usage_date", today)
              .maybeSingle();
            const newCount = (existing?.page_count ?? 0) + totalPages;
            await supabase
              .from("conversion_limits")
              .upsert(
                { identity, usage_date: today, page_count: newCount },
                { onConflict: "identity,usage_date" }
              );
          } catch (e) {
            console.error("Failed to record usage:", e);
          }
        }
      } catch (err: any) {
        console.error("Extraction error:", err);
        send({ type: "error", message: err?.message || "Extraction failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
