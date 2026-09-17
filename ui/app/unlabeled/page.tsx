"use client";
import { useEffect, useState } from "react";
import { getUnlabeled, UnlabeledFileItem } from "@/lib/api";

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

export default function UnlabeledPage() {
  const [items, setItems] = useState<UnlabeledFileItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getUnlabeled()
      .then((r) => { setItems(r.items); setTotal(r.total); })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageTitle" style={{ margin: 0 }}>Unlabeled</h1>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <p className="error-msg mb-4">{error}</p>}

      <div className="card">
        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-2)", fontSize: "0.875rem" }}>
            Fetching files from storage…
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-2)", fontSize: "0.875rem" }}>
            {error ? null : "All files in storage are labeled."}
          </div>
        ) : (
          <>
            <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", fontSize: "0.78rem", color: "var(--text-3)" }}>
              {total} unlabeled {total === 1 ? "file" : "files"}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.absolutePath}>
                    <td style={{ fontWeight: 500, maxWidth: 340 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.absolutePath}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.absolutePath}
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{fmtBytes(item.sizeBytes)}</td>
                    <td>
                      {item.tracked
                        ? <span className="badge badge-green">{item.mediaItem?.status ?? "Tracked"}</span>
                        : <span className="badge badge-gray">Untracked</span>}
                    </td>
                    <td>
                      {item.mediaItem
                        ? <span className="badge badge-gray">{item.mediaItem.mediaType}</span>
                        : <span style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>—</span>}
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        {item.cdnUrl && (
                          <a
                            href={item.cdnUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                          >
                            Open
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
