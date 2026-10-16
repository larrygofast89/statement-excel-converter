import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

// 解析站点真实 origin。
// 关键：Render 等平台通过反向代理转发请求，request.url 的 host 是内部地址（如 localhost:10000），
// 必须用环境变量指定真实域名，否则重定向会跳到内部地址。
function getSiteOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  // 兜底：优先取代理转发的真实 host（x-forwarded-host）
  const fwdHost = request.headers.get("x-forwarded-host");
  const fwdProto = request.headers.get("x-forwarded-proto");
  if (fwdHost) return `${fwdProto || "https"}://${fwdHost}`;
  // 最后兜底：本地开发，直接用 request.url 的 origin
  return new URL(request.url).origin;
}

// 处理邮箱确认链接（signup 验证 + recovery 密码重置）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const origin = getSiteOrigin(request);

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/?auth=error`);
  }

  // 根据 type 决定跳转目标
  const redirectTarget =
    type === "recovery" ? `${origin}/reset-password` : `${origin}/?auth=confirmed`;

  const response = NextResponse.redirect(redirectTarget);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(`${origin}/?auth=error`);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    return NextResponse.redirect(`${origin}/?auth=error`);
  }

  return response;
}
