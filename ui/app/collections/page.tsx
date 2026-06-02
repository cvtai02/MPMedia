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

  // collection form
  const [showColForm, setShowColForm] = useState(false);
  const [editingCol, setEditingCol] = useState<Collection | null>(null);
  const [colName, setColName] = useState("");
  const [colSaving, setColSaving] = useState(false);
  const [colError, setColError] = useState("");

  // label form
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [editingLabel, setEditingLabel] = useState<CollectionLabel | null>(null);
  const [targetCollectionId, setTargetCollectionId] = useState("");
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
    if (!confirm(`Delete collection "${c.name}"?`)) return;
    try { await deleteCollection(c.id); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Delete failed"); }
  };

  const openAddLabel = (collectionId: string) => {
    setEditingLabel(null); setTargetCollectionId(collectionId); setLabelValue(""); setLabelError(""); setShowLabelForm(true);
  };
  const openEditLabel = (l: CollectionLabel) => {
    setEditingLabel(l); setTargetCollectionId(l.collectionId); setLabelValue(l.value); setLabelError(""); setShowLabelForm(true);
  };

  const saveLabel = async (e: React.FormEvent) => {
    e.preventDefault(); setLabelSaving(true); setLabelError("");
    try {
      if (editingLabel) await updateCollectionLabel(targetCollectionId, editingLabel.id, { value: labelValue });
      else await createCollectionLabel(targetCollectionId, labelValue);
      setShowLabelForm(false); load();
    } catch (err: unknown) { setLabelError(err instanceof Error ? err.message : "Error"); }
    finally { setLabelSaving(false); }
  };

  const removeLabel = async (l: CollectionLabel) => {
    if (!confirm(`Delete label "${l.value}"?`)) return;
    try { await deleteCollectionLabel(l.collectionId, l.id); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Delete failed"); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageTitle" style={{ margin: 0 }}>Collections</h1>
        <button className="btn btn-primary" onClick={openCreateCol}>+ New Collection</button>
      </div>

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : collections.length === 0 ? (
        <div className="card"><p style={{ color: "#6b7280", textAlign: "center", padding: "32px 0" }}>No collections yet.</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {collections.map(col => (
            <div className="card" key={col.id}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span style={{ fontWeight: 700, fontSize: "1rem" }}>{col.name}</span>
                  <span style={{ color: "#9ca3af", fontSize: "0.8rem", marginLeft: 10 }}>{col.labels.length} labels</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => openAddLabel(col.id)}>+ Label</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEditCol(col)}>Rename</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeCol(col)}>Delete</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {col.labels.length === 0 ? (
                  <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No labels yet.</span>
                ) : col.labels.map(l => (
                  <div key={l.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 20, padding: "4px 10px 4px 12px", fontSize: "0.8rem" }}>
                    <span style={{ fontWeight: 500 }}>{l.value}</span>
                    <button onClick={() => openEditLabel(l)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0 2px", fontSize: "0.8rem" }} title="Edit">✎</button>
                    <button onClick={() => removeLabel(l)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "0 2px", fontSize: "0.8rem" }} title="Delete">×</button>
                  </div>
                ))}
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
                <input value={colName} onChange={e => setColName(e.target.value)} required autoFocus placeholder="e.g. mood" />
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
            <div className="modal-title">{editingLabel ? "Edit Label" : `Add Label to "${collections.find(c => c.id === targetCollectionId)?.name}"`}</div>
            <form onSubmit={saveLabel}>
              <div className="form-group">
                <label>Value</label>
                <input value={labelValue} onChange={e => setLabelValue(e.target.value)} required autoFocus placeholder={targetCollectionId && collections.find(c=>c.id===targetCollectionId)?.name === 'speed' ? 'e.g. 120bpm' : 'e.g. chill'} />
                {collections.find(c => c.id === targetCollectionId)?.name === 'speed' && (
                  <small style={{ color: "#6b7280", marginTop: 4, display: "block" }}>For custom BPM enter e.g. "120bpm"</small>
                )}
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