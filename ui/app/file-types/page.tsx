"use client";
import { useEffect, useState } from "react";
import { listFileTypes, createFileType, updateFileType, deleteFileType, FileType } from "@/lib/api";

const STRATEGIES = [
  { value: "download", label: "Download" },
  { value: "audio",    label: "Audio player" },
  { value: "video",    label: "Video player" },
  { value: "image",    label: "Image preview" },
  { value: "text",     label: "Text viewer" },
  { value: "new-tab",  label: "Open in new tab" },
];

const STRATEGY_LABELS: Record<string, string> = Object.fromEntries(STRATEGIES.map(s => [s.value, s.label]));

export default function FileTypesPage() {
  const [items, setItems] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FileType | null>(null);
  const [name, setName] = useState("");
  const [openStrategy, setOpenStrategy] = useState("download");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => listFileTypes().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setName(""); setOpenStrategy("download"); setError(""); setShowForm(true); };
  const openEdit = (ft: FileType) => { setEditing(ft); setName(ft.name); setOpenStrategy(ft.openStrategy ?? "download"); setError(""); setShowForm(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      if (editing) await updateFileType(editing.id, { name, openStrategy });
      else await createFileType(name, undefined, openStrategy);
      setShowForm(false); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const remove = async (ft: FileType) => {
    if (!confirm(`Delete file type "${ft.name}"?`)) return;
    try { await deleteFileType(ft.id); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Delete failed"); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageTitle" style={{ margin: 0 }}>File Types</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New File Type</button>
      </div>

      <div className="card">
        {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : items.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "32px 0" }}>No file types yet.</p>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Open Strategy</th><th></th></tr></thead>
            <tbody>
              {items.map((ft, i) => (
                <tr key={ft.id}>
                  <td style={{ color: "#9ca3af", width: 40 }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{ft.name}</td>
                  <td>
                    <span className="badge badge-gray">{STRATEGY_LABELS[ft.openStrategy] ?? ft.openStrategy}</span>
                  </td>
                  <td>
                    <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ft)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(ft)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? "Edit File Type" : "New File Type"}</div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Name</label>
                <input value={name} onChange={e => setName(e.target.value)} required autoFocus placeholder="e.g. audio" />
              </div>
              <div className="form-group">
                <label>Open Strategy</label>
                <select value={openStrategy} onChange={e => setOpenStrategy(e.target.value)}>
                  {STRATEGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {error && <p className="error-msg mb-4">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
