"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const supabase = createBrowserSupabase();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!supabase) return;
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => (window.location.href = "/"), 1500);
    }
  };

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="auth-card">
            <div className="feature-icon" style={{ margin: "0 auto 16px" }}>
              <KeyRound size={20} strokeWidth={2} />
            </div>
            <h1 style={{ fontSize: 26, marginBottom: 8 }}>Set a new password</h1>
            <p className="modal-sub" style={{ textAlign: "center" }}>
              Enter your new password below.
            </p>

            {done ? (
              <p className="success-text" style={{ textAlign: "center", fontSize: 15 }}>
                Password updated! Redirecting…
              </p>
            ) : (
              <>
                <input
                  className="modal-input"
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  className="modal-input"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                {error && <p className="error-text">{error}</p>}
                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={submit}
                  disabled={loading || !password || !confirm}
                >
                  {loading ? "Updating…" : "Update password"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
