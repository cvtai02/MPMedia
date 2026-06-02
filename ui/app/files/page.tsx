"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  listMedia, uploadMedia, deleteMedia, cacheMedia, clearCache,
  listCollections, assignCollectionLabel, removeCollectionLabel,
  MediaItem, Collection, PaginatedMedia,
} from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10128";
const MEDIA_TYPES = ["", "image", "video", "audio", "document", "archive", "other"];
const STATUSES = ["", "Uploaded", "Cached"];
const PAGE_SIZE = 20;

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function statusBadge(s: string) {
  if (s === "Cached") return <span className="badge badge-green">Cached</span>;
  if (s === "Uploaded") return <span className="badge badge-blue">Uploaded</span>;
  return <span className="badge badge-gray">{s}</span>;
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

export default function FilesPage() {
  const [result, setResult] = useState<PaginatedMedia>({ data: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
    if (filterType) params.mediaType = filterType;
    if (filterStatus) params.status = filterStatus;
    listMedia(params).then(setResult).finally(() => setLoading(false));
  }, [page, filterType, filterStatus]);

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
    const url = `${API}/media/${item.id}/download`;
    if (strategy === "download") { window.location.href = url; return; }
    if (strategy === "new-tab") { window.open(url, "_blank"); return; }
    if (strategy === "image") { setPreview({ kind: "image", url, name: item.originalName }); return; }
    if (strategy === "audio") { setPreview({ kind: "audio", url, name: item.originalName }); return; }
    if (strategy === "video") { setPreview({ kind: "video", url, name: item.originalName }); return; }
    if (strategy === "text") {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const text = await res.text();
        setPreview({ kind: "text", url, content: text, name: item.originalName });
      } catch { alert("Failed to load text content."); }
    }
  };

  const toggleLabel = async (collectionLabelId: string) => {
    if (!selected) return;
    const has = selected.collectionLabels.some(l => l.id === collectionLabelId);
    if (has) await removeCollectionLabel(selected.id, collectionLabelId);
    else await assignCollectionLabel(selected.id, collectionLabelId);
    const fresh = await listMedia({ page, limit: PAGE_SIZE });
    setResult(fresh);
    const updated = fresh.data.find(m => m.id === selected.id) ?? selected;
    setSelected(updated);
  };

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageTitle" style={{ margin: 0 }}>Files <span style={{ color: "#6b7280", fontWeight: 400, fontSize: "1rem" }}>({result.total})</span></h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" style={{ display: "none" }} onChange={upload} />
          <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : "+ Upload"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select className="btn btn-ghost btn-sm" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} style={{ padding: "6px 10px" }}>
          {MEDIA_TYPES.map(t => <option key={t} value={t}>{t || "All types"}</option>)}
        </select>
        <select className="btn btn-ghost btn-sm" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ padding: "6px 10px" }}>
          {STATUSES.map(s => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
        {(filterType || filterStatus) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterType(""); setFilterStatus(""); setPage(1); }}>Clear</button>
        )}
      </div>

      <div className="card">
        {loading ? <p style={{ color: "#6b7280", padding: "20px 0" }}>Loading…</p> : result.data.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "40px 0" }}>No files found.</p>
        ) : (
          <>
            <table>
              <thead><tr><th>Name</th><th>File Type</th><th>Size</th><th>Status</th><th>Labels</th><th></th></tr></thead>
              <tbody>
                {result.data.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.originalName}>{item.originalName}</td>
                    <td>
                      {item.fileType
                        ? <span className="badge badge-gray" title={`Open strategy: ${item.fileType.openStrategy}`}>{item.fileType.name}</span>
                        : <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>{item.mediaType}</span>}
                    </td>
                    <td style={{ color: "#6b7280" }}>{formatBytes(item.sizeBytes)}</td>
                    <td>{statusBadge(item.status)}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {item.collectionLabels.map(l => (
                          <span key={l.id} style={{ background: "#e0e7ff", color: "#3730a3", padding: "1px 7px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600 }}>{l.value}</span>
                        ))}
                        <button className="btn btn-ghost btn-sm" style={{ padding: "0 6px", fontSize: "0.8rem" }} onClick={() => { setSelected(item); setShowLabelModal(true); }}>🏷</button>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openFile(item)} title={`Open (${resolveStrategy(item)})`}>Open</button>
                        {item.status === "Uploaded" && (
                          <button className="btn btn-ghost btn-sm" onClick={() => doCache(item)} disabled={actionLoading === item.id} title="Cache locally">📥</button>
                        )}
                        {item.status === "Cached" && (
                          <button className="btn btn-ghost btn-sm" onClick={() => doClear(item)} disabled={actionLoading === item.id} title="Clear cache">🗑</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => doDelete(item)} disabled={actionLoading === item.id}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex gap-2 items-center mt-4" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Page {page} of {totalPages}</span>
                <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal" style={{ maxWidth: preview.kind === "text" ? 700 : 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 12, wordBreak: "break-all" }}>{preview.name}</div>
            {preview.kind === "image" && (
              <img src={preview.url} alt={preview.name} style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8, display: "block", margin: "0 auto" }} />
            )}
            {preview.kind === "audio" && (
              <audio controls src={preview.url} style={{ width: "100%" }} />
            )}
            {preview.kind === "video" && (
              <video controls src={preview.url} style={{ width: "100%", maxHeight: "60vh", borderRadius: 8 }} />
            )}
            {preview.kind === "text" && (
              <pre style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, overflow: "auto", maxHeight: "65vh", fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
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

      {/* Collection label modal */}
      {showLabelModal && selected && (
        <div className="modal-overlay" onClick={() => setShowLabelModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">Labels — {selected.originalName}</div>
            {collections.length === 0 ? (
              <p style={{ color: "#6b7280" }}>No collections exist yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {collections.map(col => (
                  <div key={col.id}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{col.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {col.labels.map(l => {
                        const has = selected.collectionLabels.some(sl => sl.id === l.id);
                        return (
                          <button key={l.id} onClick={() => toggleLabel(l.id)} style={{ padding: "4px 12px", borderRadius: 999, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", border: `1px solid ${has ? "#6366f1" : "#d1d5db"}`, background: has ? "#6366f1" : "#f9fafb", color: has ? "#fff" : "#374151" }}>
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
