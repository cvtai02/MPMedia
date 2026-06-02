"use client";
import { useEffect, useState } from "react";
import { getSettings, updateSettings, AppSettings } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { getSettings().then(setSettings).finally(() => setLoading(false)); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ color: "#6b7280" }}>Loading…</p>;
  if (!settings) return null;

  return (
    <div>
      <h1 className="pageTitle">Settings</h1>
      <form onSubmit={save} style={{ maxWidth: 560 }}>
        <div className="card mb-4">
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>Cache</h2>
          <div className="form-group">
            <label>Cache Path</label>
            <input value={settings.cache.path} onChange={e => setSettings({ ...settings, cache: { ...settings.cache, path: e.target.value } })} />
          </div>
          <div className="form-group">
            <label>Max Size (MB)</label>
            <input type="number" min={1} value={settings.cache.maxSizeMb} onChange={e => setSettings({ ...settings, cache: { ...settings.cache, maxSizeMb: Number(e.target.value) } })} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" id="cacheEnabled" checked={settings.cache.enabled} onChange={e => setSettings({ ...settings, cache: { ...settings.cache, enabled: e.target.checked } })} style={{ width: "auto" }} />
            <label htmlFor="cacheEnabled" style={{ margin: 0, cursor: "pointer" }}>Enable caching</label>
          </div>
        </div>

        <div className="card mb-4">
          <h2 style={{ fontWeight: 700, marginBottom: 12, fontSize: "1rem" }}>Storage</h2>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Active provider ID: <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{settings.storage.activeProviderId ?? "none"}</code>
          </p>
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: 8 }}>Manage providers on the Storage page.</p>
        </div>

        {error && <p className="error-msg mb-4">{error}</p>}
        {saved && <p style={{ color: "#10b981", fontSize: "0.875rem", marginBottom: 12 }}>Settings saved.</p>}
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save Settings"}</button>
      </form>
    </div>
  );
}
