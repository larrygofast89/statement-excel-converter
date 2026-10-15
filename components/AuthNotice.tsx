"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

// 检测 URL 里的 auth 参数（来自 /auth/confirm 重定向），显示登录/验证结果提示
export default function AuthNotice() {
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");

    if (auth === "confirmed") {
      setNotice({
        type: "success",
        text: "Email verified — you're signed in. You can now convert unlimited statements.",
      });
    } else if (auth === "error") {
      setNotice({
        type: "error",
        text: "Invalid or expired link. Please try again.",
      });
    }

    if (auth) {
      params.delete("auth");
      const qs = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (qs ? `?${qs}` : "")
      );
    }
  }, []);

  if (!notice) return null;

  return (
    <div className={`auth-notice auth-notice-${notice.type}`}>
      {notice.type === "success" ? (
        <CheckCircle2 size={18} strokeWidth={2} />
      ) : (
        <AlertCircle size={18} strokeWidth={2} />
      )}
      <span>{notice.text}</span>
      <button className="auth-notice-close" onClick={() => setNotice(null)} aria-label="Close">
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
