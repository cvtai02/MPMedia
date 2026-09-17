"use client";
import { useEffect, useState } from "react";
import {
  getSettings, updateSettings, AppSettings,
  listFileTypes, createFileType, updateFileType, deleteFileType, FileType,
} from "@/lib/api";

type Tab = "general" | "file-types";

const STRATEGIES = [
  { value: "download", label: "Download" },
  { value: "audio",    label: "Audio player" },
  { value: "video",    label: "Video player" },
  { value: "image",    label: "Image preview" },
  { value: "text",     label: "Text viewer" },
  { value: "new-tab",  label: "Open in new tab" },
];
const STRATEGY_LABEL: Record<string, string> = Object.fromEntries(STRATEGIES.map(s => [s.value, s.label]));

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");

  // General
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  // File types
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);
  const [ftLoading, setFtLoading] = useState(false);
  const [showFtForm, setShowFtForm] = useState(false);
  const [editingFt, setEditingFt] = useState<FileType | null>(null);
  const [ftName, setFtName] = useState("");
  const [ftStrategy, setFtStrategy] = useState("download");
  const [ftSaving, setFtSaving] = useState(false);
  const [ftError, setFtError] = useState("");

  useEffect(() => {
    getSettings().then(setSettings).finally(() => setSettingsLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "file-types" && fileTypes.length === 0) loadFileTypes();
  }, [tab]);

  const loadFileTypes = () => {
    setFtLoading(true);
    listFileTypes().then(setFileTypes).finally(() => setFtLoading(false));
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSettingsSaving(true); setSettingsError(""); setSettingsSaved(false);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated); setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (err: unknown) { setSettingsError(err instanceof Error ? err.message : "Error"); }
    finally { setSettingsSaving(false); }
  };

  const openCreateFt = () => { setEditingFt(null); setFtName(""); setFtStrategy("download"); setFtError(""); setShowFtForm(true); };
  const openEditFt = (ft: FileType) => { setEditingFt(ft); setFtName(ft.name); setFtStrategy(ft.openStrategy ?? "download"); setFtError(""); setShowFtForm(true); };

  const saveFt = async (e: React.FormEvent) => {
    e.preventDefault(); setFtSaving(true); setFtError("");
    try {
      if (editingFt) await updateFileType(editingFt.id, { name: ftName, openStrategy: ftStrategy });
      else await createFileType(ftName, undefined, ftStrategy);
      setShowFtForm(false); loadFileTypes();
    } catch (err: unknown) { setFtError(err instanceof Error ? err.message : "Error"); }
    finally { setFtSaving(false); }
  };

  const removeFt = async (ft: FileType) => {
    if (!confirm(`Delete file type "${ft.name}"?`)) return;
    try { await deleteFileType(ft.id); loadFileTypes(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  if (settingsLoading) return <div style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>Loading…</div>;

  return (
    <div>
      <h1 className="pageTitle">Settings</h1>

      <div className="tabs">
        <button className={`tab ${tab === "general" ? "tab-active" : ""}`} onClick={() => setTab("general")}>General</button>
        <button className={`tab ${tab === "file-types" ? "tab-active" : ""}`} onClick={() => setTab("file-types")}>File Types</button>
      </div>

      {tab === "general" && settings && (
        <form onSubmit={saveSettings} style={{ maxWidth: 520 }}>
          <div className="card mb-4">
            <div className="section-header"><span className="section-title">Cache</span></div>
            <div style={{ padding: "16px 20px" }}>
              <div className="form-group">
                <label>Cache Path</label>
                <input value={settings.cache.path} onChange={e => setSettings({ ...settings, cache: { ...settings.cache, path: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>Max Size (MB)</label>
                <input type="number" min={1} value={settings.cache.maxSizeMb} onChange={e => setSettings({ ...settings, cache: { ...settings.cache, maxSizeMb: Number(e.target.value) } })} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <input type="checkbox" id="cacheEnabled" checked={settings.cache.enabled} onChange={e => setSettings({ ...settings, cache: { ...settings.cache, enabled: e.target.checked } })} style={{ width: "auto", accentColor: "#ededed" }} />
                <label htmlFor="cacheEnabled" style={{ margin: 0, cursor: "pointer", fontSize: "0.8rem", color: "var(--text-2)", fontWeight: 500 }}>Enable caching</label>
              </div>
            </div>
          </div>

          {settingsError && <p className="error-msg mb-4">{settingsError}</p>}
          {settingsSaved && <p style={{ color: "var(--green)", fontSize: "0.78rem", marginBottom: 12 }}>Saved.</p>}
          <button className="btn btn-primary" type="submit" disabled={settingsSaving}>{settingsSaving ? "Saving…" : "Save"}</button>
        </form>
      )}

      {tab === "file-types" && (
        <div>
          <div className="flex justify-end mb-4">
            <button className="btn btn-primary" onClick={openCreateFt}>New File Type</button>
          </div>
          <div className="card">
            {ftLoading ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-2)", fontSize: "0.875rem" }}>Loading…</div>
            ) : fileTypes.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-2)", fontSize: "0.875rem" }}>No file types yet.</div>
            ) : (
              <table>
                <thead><tr><th>Name</th><th>Open Strategy</th><th></th></tr></thead>
                <tbody>
                  {fileTypes.map(ft => (
                    <tr key={ft.id}>
                      <td style={{ fontWeight: 500 }}>{ft.name}</td>
                      <td><span className="badge badge-gray">{STRATEGY_LABEL[ft.openStrategy] ?? ft.openStrategy}</span></td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditFt(ft)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => removeFt(ft)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showFtForm && (
        <div className="modal-overlay" onClick={() => setShowFtForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editingFt ? "Edit File Type" : "New File Type"}</div>
            <form onSubmit={saveFt}>
              <div className="form-group"><label>Name</label><input value={ftName} onChange={e => setFtName(e.target.value)} required autoFocus placeholder="e.g. audio" /></div>
              <div className="form-group">
                <label>Open Strategy</label>
                <select value={ftStrategy} onChange={e => setFtStrategy(e.target.value)}>
                  {STRATEGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {ftError && <p className="error-msg mb-4">{ftError}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowFtForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={ftSaving}>{ftSaving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
