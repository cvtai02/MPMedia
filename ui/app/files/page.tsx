"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  listMedia, uploadMedia, deleteMedia, cacheMedia, clearCache,
  listCollections, assignCollectionLabel, removeCollectionLabel,
  MediaItem, Collection, PaginatedMedia,
} from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";
const MEDIA_TYPES = ["", "image", "video", "audio", "document", "archive", "other"];
const PAGE_SIZE = 20;

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

function resolveStrategy(item: MediaItem): string {
  if (item.fileType?.openStrategy) return item.fileType.openStrategy;
  switch (item.mediaType) {
    case "image": return "image";
    case "video": return "video";
    case "audio": return "audio";
    case "document": return "new-tab";
    default: return "download";
  }
}

type PreviewState =
  | { kind: "image" | "audio" | "video"; url: string; name: string }
  | { kind: "text"; url: string; content: string; name: string }
  | null;

type Tab = "all" | "unlabeled";

export default function FilesPage() {
  const [result, setResult] = useState<PaginatedMedia>({ data: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<Tab>("all");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number | boolean> = { page, limit: PAGE_SIZE };
    if (filterType) params.mediaType = filterType;
    if (tab === "unlabeled") params.unlabeled = true;
    listMedia(params).then(setResult).finally(() => setLoading(false));
  }, [page, filterType, tab]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { listCollections().then(setCollections); }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { await uploadMedia(file); load(); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const doCache = async (item: MediaItem) => {
    setActionLoading(item.id);
    try { await cacheMedia(item.id); load(); } finally { setActionLoading(null); }
  };
  const doClear = async (item: MediaItem) => {
    setActionLoading(item.id);
    try { await clearCache(item.id); load(); } finally { setActionLoading(null); }
  };
  const doDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.originalName}"?`)) return;
    setActionLoading(item.id);
    try { await deleteMedia(item.id); load(); } finally { setActionLoading(null); }
  };

  const openFile = async (item: MediaItem) => {
    const strategy = resolveStrategy(item);
    const url = `${API}/api/media/${item.id}/download`;
    if (strategy === "download") { window.location.href = url; return; }
    if (strategy === "new-tab") { window.open(url, "_blank"); return; }
    if (strategy === "image") { setPreview({ kind: "image", url, name: item.originalName }); return; }
    if (strategy === "audio") { setPreview({ kind: "audio", url, name: item.originalName }); return; }
    if (strategy === "video") { setPreview({ kind: "video", url, name: item.originalName }); return; }
    if (strategy === "text") {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const content = await res.text();
      setPreview({ kind: "text", url, content, name: item.originalName });
    }
  };

  const toggleLabel = async (collectionLabelId: string) => {
    if (!selected) return;
    const has = selected.collectionLabels.some(l => l.id === collectionLabelId);
    if (has) await removeCollectionLabel(selected.id, collectionLabelId);
    else await assignCollectionLabel(selected.id, collectionLabelId);
    const fresh = await listMedia({ page, limit: PAGE_SIZE });
    setResult(fresh);
    setSelected(fresh.data.find(m => m.id === selected.id) ?? selected);
  };

  const switchTab = (t: Tab) => { setTab(t); setPage(1); };
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="pageTitle" style={{ margin: 0 }}>Files</h1>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" style={{ display: "none" }} onChange={upload} />
          <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="tabs" style={{ marginBottom: 0, borderBottom: "none" }}>
          <button className={`tab ${tab === "all" ? "tab-active" : ""}`} onClick={() => switchTab("all")}>All</button>
          <button className={`tab ${tab === "unlabeled" ? "tab-active" : ""}`} onClick={() => switchTab("unlabeled")}>Unlabeled</button>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filterType}
            onChange={e => { setFilterType(e.target.value); setPage(1); }}
            style={{ padding: "5px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-2)", fontSize: "0.78rem", outline: "none" }}
          >
            {MEDIA_TYPES.map(t => <option key={t} value={t}>{t || "All types"}</option>)}
          </select>
          {filterType && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilterType("")}>Clear</button>
          )}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-2)", fontSize: "0.875rem" }}>Loading…</div>
        ) : result.data.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-2)", fontSize: "0.875rem" }}>No files found.</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Labels</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {result.data.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.originalName}>
                      {item.originalName}
                    </td>
                    <td>
                      {item.fileType
                        ? <span className="badge badge-gray">{item.fileType.name}</span>
                        : <span style={{ color: "var(--text-3)", fontSize: "0.78rem" }}>{item.mediaType}</span>}
                    </td>
                    <td style={{ color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>{fmtBytes(item.sizeBytes)}</td>
                    <td>
                      {item.status === "Cached"
                        ? <span className="badge badge-green">Cached</span>
                        : <span className="badge badge-gray">Uploaded</span>}
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap items-center">
                        {item.collectionLabels.map(l => (
                          <span key={l.id} style={{ background: "rgba(0,112,243,.12)", color: "#3b9eff", border: "1px solid rgba(0,112,243,.2)", padding: "1px 7px", borderRadius: 4, fontSize: "0.68rem", fontWeight: 500 }}>
                            {l.value}
                          </span>
                        ))}
                        <button
                          onClick={() => { setSelected(item); setShowLabelModal(true); }}
                          style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", color: "var(--text-3)", padding: "1px 6px", fontSize: "0.7rem", lineHeight: 1.4 }}
                          title="Edit labels"
                        >+</button>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        <button className="btn btn-ghost btn-sm" onClick={() => openFile(item)}>Open</button>
                        {item.status === "Uploaded" && (
                          <button className="btn btn-ghost btn-sm" onClick={() => doCache(item)} disabled={actionLoading === item.id} title="Cache locally">Cache</button>
                        )}
                        {item.status === "Cached" && (
                          <button className="btn btn-ghost btn-sm" onClick={() => doClear(item)} disabled={actionLoading === item.id} title="Clear cache">Uncache</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => doDelete(item)} disabled={actionLoading === item.id}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex gap-2 items-center justify-end" style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)" }}>
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span style={{ fontSize: "0.78rem", color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>{page} / {totalPages}</span>
                <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>

      {result.total > 0 && (
        <p style={{ marginTop: 10, fontSize: "0.75rem", color: "var(--text-3)" }}>{result.total} file{result.total !== 1 ? "s" : ""}</p>
      )}

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal" style={{ maxWidth: preview.kind === "text" ? 680 : 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ fontSize: "0.8rem", marginBottom: 14, color: "var(--text-2)", fontWeight: 400, wordBreak: "break-all" }}>{preview.name}</div>
            {preview.kind === "image" && <img src={preview.url} alt={preview.name} style={{ maxWidth: "100%", maxHeight: "68vh", borderRadius: 6, display: "block", margin: "0 auto" }} />}
            {preview.kind === "audio" && <audio controls src={preview.url} style={{ width: "100%" }} />}
            {preview.kind === "video" && <video controls src={preview.url} style={{ width: "100%", maxHeight: "60vh", borderRadius: 6 }} />}
            {preview.kind === "text" && (
              <pre style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 6, padding: 14, overflow: "auto", maxHeight: "62vh", fontSize: "0.78rem", color: "var(--text)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {preview.content}
              </pre>
            )}
            <div className="modal-footer">
              <a href={preview.url} download className="btn btn-ghost">Download</a>
              <button className="btn btn-primary" onClick={() => setPreview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showLabelModal && selected && (
        <div className="modal-overlay" onClick={() => setShowLabelModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Labels</div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-2)", marginBottom: 16, marginTop: -12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.originalName}</p>
            {collections.length === 0 ? (
              <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>No collections yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {collections.map(col => (
                  <div key={col.id}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{col.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {col.labels.map(l => {
                        const active = selected.collectionLabels.some(sl => sl.id === l.id);
                        return (
                          <button key={l.id} onClick={() => toggleLabel(l.id)} style={{ padding: "4px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 500, cursor: "pointer", border: `1px solid ${active ? "#0070f3" : "var(--border)"}`, background: active ? "rgba(0,112,243,.15)" : "transparent", color: active ? "#3b9eff" : "var(--text-2)", transition: "all 0.12s" }}>
                            {l.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowLabelModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
