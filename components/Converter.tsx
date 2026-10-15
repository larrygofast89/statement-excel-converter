"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileText,
  Eye,
  Download,
  AlertCircle,
  X,
  Loader2,
  Layers,
  SplitSquareHorizontal,
  Check,
} from "lucide-react";

type Transaction = {
  date: string;
  description: string;
  amount: number | null;
};

type Result = {
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  statementPeriod?: string | null;
  currency?: string | null;
  summary?: { label: string; value: string }[];
  transactions?: Transaction[];
};

// 示例转换结果（让用户不上传也能预览效果）
const SAMPLE_RESULT: Result = {
  bankName: "ACME Bank",
  accountName: "James C. Morrison",
  accountNumber: "12345678",
  currency: "USD",
  statementPeriod: "October 10 - November 9",
  summary: [
    { label: "Beginning Balance", value: "69.96" },
    { label: "Total Deposits", value: "1,876.28" },
    { label: "Total Withdrawals", value: "1,359.53" },
    { label: "Ending Balance", value: "586.71" },
  ],
  transactions: [
    { date: "2023-10-02", description: "POS PURCHASE", amount: -4.23 },
    { date: "2023-10-03", description: "PREAUTHORIZED CREDIT", amount: 763.01 },
    { date: "2023-10-04", description: "POS PURCHASE", amount: -11.68 },
    { date: "2023-10-05", description: "CHECK 1234", amount: -9.98 },
    { date: "2023-10-08", description: "POS PURCHASE", amount: -59.08 },
    { date: "2023-10-14", description: "CHECK 1237", amount: -180.63 },
    { date: "2023-10-22", description: "ATM WITHDRAWAL", amount: -140 },
    { date: "2023-11-09", description: "SERVICE CHARGE", amount: -12 },
  ],
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdfFile(f: File): boolean {
  return f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
}

// 从部分 JSON 文本中增量提取已闭合的字段和交易（流式渲染用）
function parsePartial(text: string): Result {
  const result: Result = { summary: [], transactions: [] };
  const field = (name: string): string | null => {
    const m = text.match(new RegExp('"' + name + '":("(?:[^"\\\\]|\\\\.)*"|null)'));
    if (m && m[1] !== "null") {
      try {
        return JSON.parse(m[1]);
      } catch {
        return null;
      }
    }
    return null;
  };
  result.bankName = field("bankName");
  result.accountName = field("accountName");
  result.accountNumber = field("accountNumber");
  result.currency = field("currency");
  result.statementPeriod = field("statementPeriod");

  const unescape = (s: string) => s.replace(/\\"/g, '"');

  // 已闭合的交易对象
  const txRe = /\{"date":"((?:[^"\\]|\\.)*)","description":"((?:[^"\\]|\\.)*)","amount":(-?\d+(?:\.\d+)?|null)\}/g;
  let m: RegExpExecArray | null;
  while ((m = txRe.exec(text)) !== null) {
    result.transactions!.push({
      date: unescape(m[1]),
      description: unescape(m[2]),
      amount: m[3] === "null" ? null : parseFloat(m[3]),
    });
  }

  // 已闭合的 summary 项
  const sumRe = /\{"label":"((?:[^"\\]|\\.)*)","value":"((?:[^"\\]|\\.)*)"\}/g;
  while ((m = sumRe.exec(text)) !== null) {
    result.summary!.push({ label: unescape(m[1]), value: unescape(m[2]) });
  }

  return result;
}

// 根据各页累积文本计算实时结果
function computeLive(pageTexts: Map<string, string>, mode: string): Result[] {
  const byFile: Record<number, Record<number, string>> = {};
  pageTexts.forEach((text, key) => {
    const [fi, pi] = key.split("-").map(Number);
    (byFile[fi] ||= {})[pi] = text;
  });

  const perFile: Result[] = [];
  Object.keys(byFile)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((fi) => {
      const pages = byFile[fi];
      const merged: Result = { summary: [], transactions: [] };
      Object.keys(pages)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((pi) => {
          const p = parsePartial(pages[pi]);
          if (!merged.bankName && p.bankName) merged.bankName = p.bankName;
          if (!merged.accountName && p.accountName) merged.accountName = p.accountName;
          if (!merged.accountNumber && p.accountNumber) merged.accountNumber = p.accountNumber;
          if (!merged.currency && p.currency) merged.currency = p.currency;
          if (!merged.statementPeriod && p.statementPeriod) merged.statementPeriod = p.statementPeriod;
          if (p.summary?.length) merged.summary!.push(...p.summary);
          if (p.transactions?.length) merged.transactions!.push(...p.transactions);
        });
      perFile.push(merged);
    });

  if (mode === "merge" && perFile.length > 0) {
    const merged: Result = { summary: [], transactions: [] };
    for (const f of perFile) {
      if (!merged.bankName && f.bankName) merged.bankName = f.bankName;
      if (!merged.accountName && f.accountName) merged.accountName = f.accountName;
      if (!merged.accountNumber && f.accountNumber) merged.accountNumber = f.accountNumber;
      if (!merged.currency && f.currency) merged.currency = f.currency;
      if (!merged.statementPeriod && f.statementPeriod) merged.statementPeriod = f.statementPeriod;
      if (f.summary?.length) merged.summary!.push(...f.summary);
      if (f.transactions?.length) merged.transactions!.push(...f.transactions);
    }
    return [merged];
  }

  return perFile;
}

export default function Converter() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mode, setMode] = useState<"separate" | "merge">("separate");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [progress, setProgress] = useState({ chars: 0, pages: 0, totalPages: 0 });
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, [loading]);

  const onFiles = useCallback((list: File[] | null) => {
    if (!list || !list.length) return;
    setError(null);
    setResults([]);
    setFiles(list);
    setPreviews(
      list.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : ""))
    );
  }, []);

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const convert = async () => {
    if (!files.length) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setProgress({ chars: 0, pages: 0, totalPages: 0 });

    const controller = new AbortController();
    abortRef.current = controller;
    const pageTexts = new Map<string, string>();

    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("file", f));
      fd.append("mode", mode);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: fd,
        signal: controller.signal,
      });
      if (!res.ok) {
        let msg = "Conversion failed. Please try again.";
        try {
          const data = await res.json();
          msg = data.message || data.error || msg;
        } catch {}
        throw new Error(msg);
      }
      if (!res.body) {
        throw new Error("Conversion failed. Please try again.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          let evt: any;
          try {
            evt = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }

          if (evt.type === "start") {
            setProgress((p) => ({ ...p, totalPages: evt.totalPages }));
          } else if (evt.type === "delta") {
            const key = `${evt.fileIdx}-${evt.pageIdx}`;
            pageTexts.set(key, (pageTexts.get(key) ?? "") + evt.text);
            setProgress((p) => ({ ...p, chars: p.chars + (evt.text?.length ?? 0) }));
            setResults(computeLive(pageTexts, mode));
          } else if (evt.type === "page_done") {
            const key = `${evt.fileIdx}-${evt.pageIdx}`;
            pageTexts.set(key, JSON.stringify(evt.result));
            setProgress((p) => ({ ...p, pages: p.pages + 1 }));
            setResults(computeLive(pageTexts, mode));
          } else if (evt.type === "done") {
            setResults(evt.results ?? []);
          } else if (evt.type === "error") {
            setError(evt.message);
          }
        }
      }

      setFiles([]);
      setPreviews([]);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(e.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const loadSample = () => {
    setError(null);
    setFiles([]);
    setPreviews([]);
    setResults([SAMPLE_RESULT]);
  };

  const downloadExcel = (r: Result, idx: number) => {
    const wb = XLSX.utils.book_new();

    const accountInfo: (string | number | null)[][] = [
      ["Field", "Value"],
      ["Bank Name", r.bankName ?? ""],
      ["Account Name", r.accountName ?? ""],
      ["Account Number", r.accountNumber ?? ""],
      ["Currency", r.currency ?? ""],
      ["Statement Period", r.statementPeriod ?? ""],
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(accountInfo);
    XLSX.utils.book_append_sheet(wb, wsInfo, "Account Info");

    // Summary 段（自适应：不同银行摘要字段不同）
    if (r.summary?.length) {
      const summaryRows: (string | number | null)[][] = [
        ["Item", "Value"],
        ...r.summary.map((s) => [s.label, s.value] as (string | number | null)[]),
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    }

    const wsTrans = XLSX.utils.json_to_sheet(
      (r.transactions ?? []).map((t) => ({
        Date: t.date,
        Description: t.description,
        Amount: t.amount,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsTrans, "Transactions");

    const suffix = results.length > 1 ? `-${idx + 1}` : "";
    XLSX.writeFile(wb, `bank-statement${suffix}.xlsx`);
  };

  const downloadCsv = (r: Result, idx: number) => {
    if (!r.transactions?.length) return;
    const rows = r.transactions.map((t) => [
      t.date,
      t.description,
      t.amount ?? "",
    ]);
    const csv = [["Date", "Description", "Amount"], ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const suffix = results.length > 1 ? `-${idx + 1}` : "";
    a.download = `bank-statement${suffix}.csv`;
    a.click();
  };

  const renderResult = (r: Result, idx: number) => {
    const accountInfoItems: { label: string; value: string | number }[] = [];
    if (r.bankName) accountInfoItems.push({ label: "Bank", value: r.bankName });
    if (r.accountName) accountInfoItems.push({ label: "Account", value: r.accountName });
    if (r.accountNumber) accountInfoItems.push({ label: "Number", value: r.accountNumber });
    if (r.currency) accountInfoItems.push({ label: "Currency", value: r.currency });
    if (r.statementPeriod) accountInfoItems.push({ label: "Period", value: r.statementPeriod });

    return (
      <div className="result-area" key={idx}>
        {results.length > 1 && (
          <div className="result-file-label">File {idx + 1}</div>
        )}
        <div className="result-banner">
          {loading
            ? `Extracting… ${r.transactions?.length ?? 0} transactions found so far`
            : `✓ Conversion complete — ${r.transactions?.length ?? 0} transactions extracted`}
        </div>

        {accountInfoItems.length > 0 && (
          <div className="account-info-grid">
            {accountInfoItems.map((item) => (
              <div className="account-info-item" key={item.label}>
                <div className="account-info-label">{item.label}</div>
                <div className="account-info-value">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Summary 段（账户摘要，自适应不同银行的字段） */}
        {r.summary?.length ? (
          <div className="summary-box">
            <div className="summary-title">Summary of your account</div>
            <div className="account-info-grid">
              {r.summary.map((s) => (
                <div className="account-info-item" key={s.label}>
                  <div className="account-info-label">{s.label}</div>
                  <div className="account-info-value">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {r.transactions?.length ? (
          <>
            <div className="table-wrap">
              <table className="transactions">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {r.transactions.map((t, i) => (
                    <tr key={i}>
                      <td>{t.date}</td>
                      <td>{t.description}</td>
                      <td
                        style={{ textAlign: "right" }}
                        className={(t.amount ?? 0) >= 0 ? "amount-pos" : "amount-neg"}
                      >
                        {t.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="download-actions">
              <button className="btn btn-primary" onClick={() => downloadExcel(r, idx)}>
                <Download size={16} strokeWidth={2} /> Excel (.xlsx)
              </button>
              <button className="btn btn-secondary" onClick={() => downloadCsv(r, idx)}>
                CSV
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: "var(--text-muted)", marginTop: 16 }}>
            No transactions found. Try a clearer file.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="converter-card">
      {/* 上传区（多文件） */}
      <div
        className={`upload-zone${dragOver ? " dragover" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFiles(Array.from(e.dataTransfer.files ?? []));
        }}
        onClick={() => !loading && document.getElementById("file-input")?.click()}
        style={{ pointerEvents: loading ? "none" : "auto" }}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*,application/pdf,.pdf"
          multiple
          style={{ display: "none" }}
          onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
        />
        {files.length === 0 ? (
          <div>
            <div className="upload-icon">
              <Upload size={22} strokeWidth={2} />
            </div>
            <div className="upload-title">
              Drag &amp; drop your bank statements here
            </div>
            <div className="upload-hint">
              or click to browse — PDF, PNG or JPG (scanned PDFs supported).
              Multiple files allowed.
            </div>
          </div>
        ) : (
          <div className="file-list">
            {files.map((f, i) => (
              <div className="file-item" key={`${f.name}-${i}`}>
                {previews[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previews[i]} alt={f.name} className="file-thumb" />
                ) : (
                  <FileText size={20} strokeWidth={2} className="file-icon" />
                )}
                <div className="file-meta">
                  <div className="file-name">{f.name}</div>
                  <div className="file-size">{formatBytes(f.size)}</div>
                </div>
                {!loading && (
                  <button
                    className="file-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    aria-label="Remove file"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
            <div className="file-add-more">+ Add more files</div>
          </div>
        )}
      </div>

      {/* 模式选择：多文件时显示 */}
      {files.length > 1 && !loading && (
        <div className="mode-select">
          <label
            className={`mode-option${mode === "separate" ? " active" : ""}`}
            onClick={() => setMode("separate")}
          >
            <SplitSquareHorizontal size={16} strokeWidth={2} />
            <span>
              <strong>Separate files</strong>
              <small>One result per file</small>
            </span>
          </label>
          <label
            className={`mode-option${mode === "merge" ? " active" : ""}`}
            onClick={() => setMode("merge")}
          >
            <Layers size={16} strokeWidth={2} />
            <span>
              <strong>Combine into one</strong>
              <small>Merge all transactions</small>
            </span>
          </label>
        </div>
      )}

      {/* 限制说明：操作前说明，避免最后一步才暴露门槛 */}
      <p className="limits-note">
        Free · No signup · Typically 1–2 minutes per PDF page · Files deleted
        after processing
      </p>

      {/* 转换 / 停止 */}
      {loading ? (
        <div className="progress-area">
          <div className="progress-row">
            <Loader2 size={18} strokeWidth={2} className="spinner" />
            <span>
              Extracting transactions… {elapsed}s
              {progress.totalPages > 0 &&
                ` · ${Math.min(progress.pages, progress.totalPages)}/${progress.totalPages} pages`}
            </span>
          </div>

          {/* 步骤指示器 */}
          {(() => {
            const totalTx = results.reduce(
              (n, r) => n + (r.transactions?.length ?? 0),
              0
            );
            let step = 0;
            if (progress.chars > 0 || totalTx > 0) step = 1;
            if (progress.totalPages > 0 && progress.pages >= progress.totalPages) step = 2;
            const labels = ["Analyzing", "Extracting", "Generating"];
            return (
              <div className="steps-indicator">
                {labels.map((label, i) => (
                  <div
                    key={label}
                    className={`step-pill${step === i ? " active" : step > i ? " done" : ""}`}
                  >
                    {step > i ? (
                      <Check size={12} strokeWidth={3} />
                    ) : (
                      <span className="step-dot">{i + 1}</span>
                    )}
                    {label}
                  </div>
                ))}
              </div>
            );
          })()}

          <button className="btn btn-danger btn-block" onClick={stop} style={{ marginTop: 12 }}>
            Stop
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={convert}
          disabled={!files.length}
          style={{ marginTop: 16 }}
        >
          {files.length
            ? `Convert ${files.length > 1 ? `${files.length} files` : "to Excel"}`
            : "Upload a file to start"}
        </button>
      )}

      {/* 可点击的示例：仅在未选文件时显示 */}
      {!loading && files.length === 0 && (
        <button
          className="btn btn-secondary btn-block"
          onClick={loadSample}
          style={{ marginTop: 10 }}
        >
          <Eye size={16} strokeWidth={2} /> See a sample result
        </button>
      )}

      {error && (
        <p className="error-text">
          <AlertCircle size={16} strokeWidth={2} style={{ verticalAlign: "-3px", marginRight: 6 }} />
          {error}
        </p>
      )}

      {/* 结果区：可能多个结果 */}
      {results.map((r, i) => renderResult(r, i))}
    </div>
  );
}
