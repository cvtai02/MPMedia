"use client";
import { useEffect, useState } from "react";
import { getRouterSettings, updateRouterSettings, RouterSettings } from "@/lib/api";

export default function StoragePage() {
  const [settings, setSettings] = useState<RouterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getRouterSettings().then(setSettings).finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const updated = await updateRouterSettings({ accessToken: settings.accessToken, basePath: settings.basePath });
      setSettings(updated); setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>Loading…</div>;

  return (
    <div>
      <h1 className="pageTitle">Storage</h1>
      <form onSubmit={save} style={{ maxWidth: 520 }}>
        <div className="card mb-4">
          <div className="section-header"><span className="section-title">7Router</span></div>
          <div style={{ padding: "16px 20px" }}>
            <div className="form-group">
              <label>Access Token</label>
              <input
                type="password"
                value={settings?.accessToken ?? ""}
                onChange={e => setSettings(s => s ? { ...s, accessToken: e.target.value } : s)}
                placeholder="Bearer token"
                autoComplete="new-password"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Base Path</label>
              <input
                value={settings?.basePath ?? ""}
                onChange={e => setSettings(s => s ? { ...s, basePath: e.target.value } : s)}
                placeholder="CloudflareR2/account/bucket/folder"
              />
            </div>
          </div>
        </div>
        {error && <p className="error-msg mb-4">{error}</p>}
        {saved && <p style={{ color: "var(--green)", fontSize: "0.78rem", marginBottom: 12 }}>Saved.</p>}
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </form>
    </div>
  );
}
