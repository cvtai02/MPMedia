"use client";
import { useEffect, useState } from "react";
import { listProviders, createProvider, updateProvider, activateProvider, testProvider, deleteProvider, StorageProvider } from "@/lib/api";

type ProviderType = "LocalDisk" | "R2" | "GoogleDrive";

interface FieldDef { key: string; label: string; placeholder?: string; type?: "text" | "password" }

const FIELDS: Record<ProviderType, FieldDef[]> = {
  LocalDisk: [
    { key: "basePath", label: "Base Path", placeholder: ".local-storage" },
  ],
  R2: [
    { key: "accountId", label: "Account ID" },
    { key: "accessKeyId", label: "Access Key ID" },
    { key: "secretAccessKey", label: "Secret Access Key", type: "password" },
    { key: "bucketName", label: "Bucket Name" },
    { key: "publicBaseUrl", label: "Public Base URL (optional)", placeholder: "https://..." },
  ],
  GoogleDrive: [
    { key: "clientId", label: "Client ID" },
    { key: "clientSecret", label: "Client Secret", type: "password" },
    { key: "refreshToken", label: "Refresh Token", type: "password" },
    { key: "folderId", label: "Folder ID (optional)" },
  ],
};

function emptySettings(type: ProviderType): Record<string, string> {
  return Object.fromEntries(FIELDS[type].map(f => [f.key, ""]));
}

export default function StoragePage() {
  const [providers, setProviders] = useState<StorageProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, { healthy: boolean; message: string }>>({});

  // create form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createType, setCreateType] = useState<ProviderType>("LocalDisk");
  const [createSettings, setCreateSettings] = useState<Record<string, string>>(emptySettings("LocalDisk"));
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  // edit form
  const [editing, setEditing] = useState<StorageProvider | null>(null);
  const [editName, setEditName] = useState("");
  const [editSettings, setEditSettings] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const load = () => listProviders().then(setProviders).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setCreateName(""); setCreateType("LocalDisk"); setCreateSettings(emptySettings("LocalDisk")); setCreateError(""); setShowCreate(true);
  };
  const onTypeChange = (t: ProviderType) => { setCreateType(t); setCreateSettings(emptySettings(t)); };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateSaving(true); setCreateError("");
    try {
      await createProvider({ name: createName, type: createType, settings: createSettings });
      setShowCreate(false); load();
    } catch (err: unknown) { setCreateError(err instanceof Error ? err.message : "Error"); }
    finally { setCreateSaving(false); }
  };

  const openEdit = (p: StorageProvider) => {
    setEditing(p);
    setEditName(p.name);
    const fields = FIELDS[p.type as ProviderType] ?? [];
    const current = p.settings as Record<string, string>;
    setEditSettings(Object.fromEntries(fields.map(f => [f.key, current[f.key] ?? ""])));
    setEditError("");
  };

  const submitEdit = async (e: React.FormEvent) => {
    if (!editing) return;
    e.preventDefault(); setEditSaving(true); setEditError("");
    try {
      await updateProvider(editing.id, { name: editName, settings: editSettings });
      setEditing(null); load();
    } catch (err: unknown) { setEditError(err instanceof Error ? err.message : "Error"); }
    finally { setEditSaving(false); }
  };

  const activate = async (id: string) => { await activateProvider(id); load(); };
  const test = async (id: string) => {
    const result = await testProvider(id);
    setTestResults(r => ({ ...r, [id]: result }));
  };
  const remove = async (p: StorageProvider) => {
    if (p.isActive) return alert("Cannot delete the active provider.");
    if (!confirm(`Delete "${p.name}"?`)) return;
    await deleteProvider(p.id); load();
  };

  const editFields = editing ? (FIELDS[editing.type as ProviderType] ?? []) : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageTitle" style={{ margin: 0 }}>Storage Providers</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Provider</button>
      </div>

      <div className="card">
        {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : providers.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "32px 0" }}>No storage providers yet.</p>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Health</th><th></th></tr></thead>
            <tbody>
              {providers.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span className="badge badge-gray">{p.type}</span></td>
                  <td>{p.isActive ? <span className="badge badge-green">Active</span> : <span className="badge badge-gray">Inactive</span>}</td>
                  <td>
                    {testResults[p.id] ? (
                      <span className={`badge ${testResults[p.id].healthy ? "badge-green" : "badge-red"}`}>
                        {testResults[p.id].healthy ? "Healthy" : testResults[p.id].message}
                      </span>
                    ) : "—"}
                  </td>
                  <td>
                    <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => test(p.id)}>Test</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      {!p.isActive && <button className="btn btn-success btn-sm" onClick={() => activate(p.id)}>Activate</button>}
                      {!p.isActive && <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Storage Provider</div>
            <form onSubmit={submitCreate}>
              <div className="form-group">
                <label>Name</label>
                <input value={createName} onChange={e => setCreateName(e.target.value)} required autoFocus placeholder="My Storage" />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={createType} onChange={e => onTypeChange(e.target.value as ProviderType)}>
                  <option value="LocalDisk">Local Disk</option>
                  <option value="R2">Cloudflare R2</option>
                  <option value="GoogleDrive">Google Drive</option>
                </select>
              </div>
              {FIELDS[createType].map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input
                    type={f.type ?? "text"}
                    value={createSettings[f.key] ?? ""}
                    onChange={e => setCreateSettings(s => ({ ...s, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              {createError && <p className="error-msg mb-4">{createError}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createSaving}>{createSaving ? "Creating…" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Edit — {editing.name}</div>
            <form onSubmit={submitEdit}>
              <div className="form-group">
                <label>Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label>Type</label>
                <input value={editing.type} disabled style={{ background: "#f3f4f6", color: "#6b7280" }} />
              </div>
              {editFields.map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input
                    type={f.type ?? "text"}
                    value={editSettings[f.key] ?? ""}
                    onChange={e => setEditSettings(s => ({ ...s, [f.key]: e.target.value }))}
                    placeholder={f.placeholder ?? (f.type === "password" ? "leave blank to keep current" : "")}
                  />
                </div>
              ))}
              {editError && <p className="error-msg mb-4">{editError}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editSaving}>{editSaving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
