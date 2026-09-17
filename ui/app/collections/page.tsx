"use client";
import { useEffect, useState } from "react";
import {
  listCollections, createCollection, updateCollection, deleteCollection,
  createCollectionLabel, updateCollectionLabel, deleteCollectionLabel,
  Collection, CollectionLabel,
} from "@/lib/api";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const [showColForm, setShowColForm] = useState(false);
  const [editingCol, setEditingCol] = useState<Collection | null>(null);
  const [colName, setColName] = useState("");
  const [colSaving, setColSaving] = useState(false);
  const [colError, setColError] = useState("");

  const [showLabelForm, setShowLabelForm] = useState(false);
  const [editingLabel, setEditingLabel] = useState<CollectionLabel | null>(null);
  const [targetColId, setTargetColId] = useState("");
  const [labelValue, setLabelValue] = useState("");
  const [labelSaving, setLabelSaving] = useState(false);
  const [labelError, setLabelError] = useState("");

  const load = () => listCollections().then(setCollections).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreateCol = () => { setEditingCol(null); setColName(""); setColError(""); setShowColForm(true); };
  const openEditCol = (c: Collection) => { setEditingCol(c); setColName(c.name); setColError(""); setShowColForm(true); };

  const saveCol = async (e: React.FormEvent) => {
    e.preventDefault(); setColSaving(true); setColError("");
    try {
      if (editingCol) await updateCollection(editingCol.id, { name: colName });
      else await createCollection(colName);
      setShowColForm(false); load();
    } catch (err: unknown) { setColError(err instanceof Error ? err.message : "Error"); }
    finally { setColSaving(false); }
  };

  const removeCol = async (c: Collection) => {
    if (!confirm(`Delete "${c.name}" and all its labels?`)) return;
    try { await deleteCollection(c.id); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const openAddLabel = (colId: string) => { setEditingLabel(null); setTargetColId(colId); setLabelValue(""); setLabelError(""); setShowLabelForm(true); };
  const openEditLabel = (l: CollectionLabel) => { setEditingLabel(l); setTargetColId(l.collectionId); setLabelValue(l.value); setLabelError(""); setShowLabelForm(true); };

  const saveLabel = async (e: React.FormEvent) => {
    e.preventDefault(); setLabelSaving(true); setLabelError("");
    try {
      if (editingLabel) await updateCollectionLabel(targetColId, editingLabel.id, { value: labelValue });
      else await createCollectionLabel(targetColId, labelValue);
      setShowLabelForm(false); load();
    } catch (err: unknown) { setLabelError(err instanceof Error ? err.message : "Error"); }
    finally { setLabelSaving(false); }
  };

  const removeLabel = async (l: CollectionLabel) => {
    if (!confirm(`Delete label "${l.value}"?`)) return;
    try { await deleteCollectionLabel(l.collectionId, l.id); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageTitle" style={{ margin: 0 }}>Collections</h1>
        <button className="btn btn-primary" onClick={openCreateCol}>New Collection</button>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>Loading…</div>
      ) : collections.length === 0 ? (
        <div className="card" style={{ padding: "48px 0", textAlign: "center" }}>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>No collections yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {collections.map(col => (
            <div className="card" key={col.id}>
              <div className="section-header">
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{col.name}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{col.labels.length} label{col.labels.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => openAddLabel(col.id)}>Add Label</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEditCol(col)}>Rename</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeCol(col)}>Delete</button>
                </div>
              </div>
              <div style={{ padding: "14px 20px" }}>
                {col.labels.length === 0 ? (
                  <span style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>No labels yet.</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {col.labels.map(l => (
                      <div key={l.id} style={{ display: "inline-flex", alignItems: "center", gap: 2, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px 3px 10px", fontSize: "0.78rem" }}>
                        <span style={{ color: "var(--text-2)" }}>{l.value}</span>
                        <button onClick={() => openEditLabel(l)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "0 3px", fontSize: "0.85rem", lineHeight: 1 }} title="Rename">✎</button>
                        <button onClick={() => removeLabel(l)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "0 2px", fontSize: "1rem", lineHeight: 1 }} title="Delete">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showColForm && (
        <div className="modal-overlay" onClick={() => setShowColForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editingCol ? "Rename Collection" : "New Collection"}</div>
            <form onSubmit={saveCol}>
              <div className="form-group">
                <label>Name</label>
                <input value={colName} onChange={e => setColName(e.target.value)} required autoFocus placeholder="e.g. Mood" />
              </div>
              {colError && <p className="error-msg mb-4">{colError}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowColForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={colSaving}>{colSaving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLabelForm && (
        <div className="modal-overlay" onClick={() => setShowLabelForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editingLabel ? "Edit Label" : `Add Label`}</div>
            {!editingLabel && <p style={{ fontSize: "0.78rem", color: "var(--text-2)", marginBottom: 16, marginTop: -12 }}>in {collections.find(c => c.id === targetColId)?.name}</p>}
            <form onSubmit={saveLabel}>
              <div className="form-group">
                <label>Value</label>
                <input value={labelValue} onChange={e => setLabelValue(e.target.value)} required autoFocus placeholder="e.g. chill" />
              </div>
              {labelError && <p className="error-msg mb-4">{labelError}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowLabelForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={labelSaving}>{labelSaving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
