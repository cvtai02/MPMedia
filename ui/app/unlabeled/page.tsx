"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  listMedia, deleteMedia, listCollections, assignCollectionLabel, removeCollectionLabel,
  MediaItem, Collection, PaginatedMedia,
} from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PAGE_SIZE = 20;

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function UnlabeledPage() {
  const [result, setResult] = useState<PaginatedMedia>({ data: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listMedia({ page, limit: PAGE_SIZE, unlabeled: true }).then(setResult).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { listCollections().then(setCollections); }, []);

  const doDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.originalName}"?`)) return;
    setActionLoading(item.id);
    try { await deleteMedia(item.id); load(); } finally { setActionLoading(null); }
  };

  const toggleLabel = async (collectionLabelId: string) => {
    if (!selected) return;
    const has = selected.collectionLabels.some(l => l.id === collectionLabelId);
    if (has) await removeCollectionLabel(selected.id, collectionLabelId);
    else await assignCollectionLabel(selected.id, collectionLabelId);
    // after assigning at least one label the file leaves this list; reload both
    load();
    const fresh = await listMedia({ page, limit: PAGE_SIZE, unlabeled: true });
    const updated = fresh.data.find(m => m.id === selected.id);
    setSelected(updated ?? null);
    if (!updated) setSelected(null);
  };

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageTitle" style={{ margin: 0 }}>
          Unlabeled <span style={{ color: "#6b7280", fontWeight: 400, fontSize: "1rem" }}>({result.total})</span>
        </h1>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ color: "#6b7280", padding: "20px 0" }}>Loading…</p>
        ) : result.data.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "40px 0" }}>All files have labels.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>Size</th><th></th></tr>
              </thead>
              <tbody>
                {result.data.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.originalName}>
                      {item.originalName}
                    </td>
                    <td>
                      {item.fileType
                        ? <span className="badge badge-gray">{item.fileType.name}</span>
                        : <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>{item.mediaType}</span>}
                    </td>
                    <td style={{ color: "#6b7280" }}>{formatBytes(item.sizeBytes)}</td>
                    <td>
                      <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelected(item)}
                        >
                          Assign labels
                        </button>
                        <a
                          href={`${API}/media/${item.id}/download`}
                          target="_blank" rel="noreferrer"
                          className="btn btn-ghost btn-sm"
                        >↓</a>
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

      {/* Label assignment panel */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">Assign labels — {selected.originalName}</div>
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
              <button className="btn btn-primary" onClick={() => setSelected(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
