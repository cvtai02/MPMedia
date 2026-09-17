"use client";
import { useState } from "react";
import { login } from "@/lib/api";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { accessToken } = await login(token);
      localStorage.setItem("token", accessToken);
      window.location.href = "/files";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid token");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 340 }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ width: 36, height: 36, background: "#ededed", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800, color: "#000", margin: "0 auto 16px", letterSpacing: "-0.03em" }}>MP</div>
          <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>MPMedia</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>Enter your access token to continue</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "24px" }}>
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Access Token</label>
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
                autoFocus
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="error-msg mb-4">{error}</p>}
            <button className="btn btn-primary w-full" style={{ justifyContent: "center", marginTop: 4 }} disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
