"use client";
import { useState } from "react";

interface UseCaseDef {
  id: string;
  title: string;
  description: string;
  method: string;
  endpoint: string;
  requestBody?: object;
  responseBody?: object;
  notes?: string[];
}

const API_BASE = "http://localhost:20134";

const USE_CASES: UseCaseDef[] = [
  {
    id: "get-resource",
    title: "Get resource",
    description: "Return a list of mp4 and mp3 file paths matching the given description.",
    method: "POST",
    endpoint: "/media/streams",
    requestBody: { description: "chill lo-fi music" },
    responseBody: {
      items: [
        {
          id: "<mediaItemId>",
          name: "track.mp3",
          mimeType: "audio/mpeg",
          path: "/storage/media/abc/track.mp3",
          cdnUrl: "https://cdn.example.com/track.mp3",
        },
      ],
    },
    notes: ["Not yet implemented — returns empty list."],
  },
];


const METHOD_COLORS: Record<string, string> = {
  GET: "#3ecf8e",
  POST: "#0070f3",
  PATCH: "#f5a623",
  DELETE: "#f55",
};

function buildCurl(uc: UseCaseDef): string {
  const lines = [
    `curl -X ${uc.method} "${API_BASE}${uc.endpoint}" \\`,
    `  -H "Authorization: Bearer <token>"`,
  ];
  if (uc.requestBody) {
    lines[lines.length - 1] += " \\";
    lines.push(`  -H "Content-Type: application/json" \\`);
    lines.push(`  -d '${JSON.stringify(uc.requestBody, null, 2).split("\n").join("\n  ")}'`);
  }
  return lines.join("\n");
}

function toMarkdown(uc: UseCaseDef): string {
  const lines: string[] = [];
  lines.push(`# ${uc.title}`, "", uc.description, "", "## Endpoint", "");
  lines.push(`\`\`\`\n${uc.method} ${API_BASE}${uc.endpoint}\n\`\`\``, "");
  lines.push(`**Authorization:** \`Bearer <token>\``, "");
  if (uc.requestBody) {
    lines.push("## Request Body", "", "```json", JSON.stringify(uc.requestBody, null, 2), "```", "");
  }
  if (uc.responseBody) {
    lines.push("## Response", "", "```json", JSON.stringify(uc.responseBody, null, 2), "```", "");
  }
  lines.push("## Example (curl)", "", "```bash", buildCurl(uc), "```", "");
  if (uc.notes?.length) {
    lines.push("## Notes", "");
    uc.notes.forEach((n) => lines.push(`- ${n}`));
    lines.push("");
  }
  return lines.join("\n");
}

function download(uc: UseCaseDef) {
  const blob = new Blob([toMarkdown(uc)], { type: "text/markdown" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `${uc.id}.md`,
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadAll() {
  const md = USE_CASES.map(toMarkdown).join("\n---\n\n");
  const blob = new Blob([md], { type: "text/markdown" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: "api-usecases.md",
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: "0.65rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      color: METHOD_COLORS[method] ?? "#888",
      minWidth: 44,
      textAlign: "right",
      fontFamily: "monospace",
    }}>{method}</span>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre style={{
      background: "var(--bg-subtle)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)",
      padding: "12px 14px",
      fontSize: "0.78rem",
      lineHeight: 1.6,
      overflowX: "auto",
      color: "var(--text)",
      fontFamily: "ui-monospace, SFMono-Regular, monospace",
      whiteSpace: "pre",
    }}>{children}</pre>
  );
}

export default function UseCasesPage() {
  const [selectedId, setSelectedId] = useState<string>(USE_CASES[0].id);
  const uc = USE_CASES.find((u) => u.id === selectedId) ?? USE_CASES[0];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 0px)", overflow: "hidden", gap: 0 }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            API Reference
          </span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {USE_CASES.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "6px 16px",
                background: selectedId === item.id ? "var(--surface-2)" : "transparent",
                border: "none",
                borderLeft: `2px solid ${selectedId === item.id ? METHOD_COLORS[item.method] ?? "var(--blue)" : "transparent"}`,
                cursor: "pointer",
                textAlign: "left",
                color: selectedId === item.id ? "var(--text)" : "var(--text-2)",
                fontSize: "0.8rem",
                lineHeight: 1.3,
              }}
            >
              <MethodBadge method={item.method} />
              <span style={{ flex: 1 }}>{item.title}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
          <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={downloadAll}>
            Download all (.md)
          </button>
        </div>
      </aside>

      {/* Detail panel */}
      <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        <div style={{ maxWidth: 720 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>{uc.title}</h1>
            <button className="btn btn-ghost btn-sm" onClick={() => download(uc)}>Export .md</button>
          </div>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem", marginBottom: 24 }}>{uc.description}</p>

          {/* Endpoint */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Endpoint</div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 14px",
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: "0.85rem",
            }}>
              <span style={{ fontWeight: 700, color: METHOD_COLORS[uc.method] ?? "#888" }}>{uc.method}</span>
              <span style={{ color: "var(--text-2)" }}>{API_BASE}</span>
              <span style={{ color: "var(--text)" }}>{uc.endpoint}</span>
            </div>
          </div>

          {/* Auth */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Authorization</div>
            <code style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>Bearer &lt;token&gt;</code>
          </div>

          {/* Request body */}
          {uc.requestBody && (
            <div style={{ marginBottom: 24 }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Request Body</div>
              <CodeBlock>{JSON.stringify(uc.requestBody, null, 2)}</CodeBlock>
            </div>
          )}

          {/* Response */}
          {uc.responseBody && (
            <div style={{ marginBottom: 24 }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Response</div>
              <CodeBlock>{JSON.stringify(uc.responseBody, null, 2)}</CodeBlock>
            </div>
          )}

          {/* Curl */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Example (curl)</div>
            <CodeBlock>{buildCurl(uc)}</CodeBlock>
          </div>

          {/* Notes */}
          {uc.notes && uc.notes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Notes</div>
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {uc.notes.map((n, i) => (
                  <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-2)" }}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Markdown preview */}
          <div>
            <div className="section-title" style={{ marginBottom: 8 }}>Markdown Preview</div>
            <CodeBlock>{toMarkdown(uc)}</CodeBlock>
          </div>
        </div>
      </main>
    </div>
  );
}
