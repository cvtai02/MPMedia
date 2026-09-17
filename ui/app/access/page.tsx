"use client";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:20134";

export default function AccessTokenPage() {
  const [token, setToken] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("token") ?? "");
  }, []);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const curlExample = `curl -X POST "${API_BASE}/media/streams" \\
  -H "Authorization: Bearer ${token || "<token>"}" \\
  -H "Content-Type: application/json"`;

  return (
    <div>
      <h1 className="pageTitle">Access Token</h1>

      <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Token card */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Bearer Token</span>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setVisible(v => !v)}>
                {visible ? "Hide" : "Show"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => copy(token)} disabled={!token}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div style={{ padding: "14px 20px" }}>
            <div style={{
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: "0.8rem",
              color: token ? "var(--text)" : "var(--text-3)",
              wordBreak: "break-all",
              lineHeight: 1.6,
            }}>
              {token
                ? (visible ? token : token.replace(/./g, "•"))
                : "No token — sign in first."}
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Usage</span>
          </div>
          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: "0.83rem", color: "var(--text-2)" }}>
              Pass the token in the <code style={{ color: "var(--text)", background: "var(--surface-2)", padding: "1px 5px", borderRadius: 4 }}>Authorization</code> header of every request.
            </p>
            <pre style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 14px",
              fontSize: "0.78rem",
              color: "var(--text)",
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              overflowX: "auto",
              whiteSpace: "pre",
              lineHeight: 1.6,
            }}>{curlExample}</pre>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => copy(curlExample)}>Copy curl</button>
            </div>
          </div>
        </div>

        {/* API base */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">API Base</span>
            <button className="btn btn-ghost btn-sm" onClick={() => copy(API_BASE)}>Copy</button>
          </div>
          <div style={{ padding: "14px 20px" }}>
            <code style={{ fontSize: "0.83rem", color: "var(--text-2)" }}>{API_BASE}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
