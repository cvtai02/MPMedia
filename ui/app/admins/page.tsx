"use client";
import { useEffect, useState } from "react";
import { listAdmins, createAdmin, updateAdmin, deleteAdmin, Admin, getMe } from "@/lib/api";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("Admin");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    Promise.all([listAdmins(), getMe()])
      .then(([list, me]) => { setAdmins(list); setCurrentId(me.id); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEmail(""); setPassword(""); setDisplayName(""); setRole("Admin"); setError(""); setShowForm(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await createAdmin({ email, password, displayName: displayName || undefined, role });
      setShowForm(false); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const toggleActive = async (a: Admin) => {
    if (a.id === currentId) return;
    await updateAdmin(a.id, { isActive: !a.isActive }); load();
  };

  const remove = async (a: Admin) => {
    if (a.id === currentId) return alert("Cannot delete your own account.");
    if (!confirm(`Delete ${a.email}?`)) return;
    await deleteAdmin(a.id); load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageTitle" style={{ margin: 0 }}>Admins</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Admin</button>
      </div>

      <div className="card">
        {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
          <table>
            <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.email}{a.id === currentId && <span className="badge badge-blue" style={{ marginLeft: 8 }}>You</span>}</td>
                  <td style={{ color: "#6b7280" }}>{a.displayName ?? "—"}</td>
                  <td><span className={`badge ${a.role === "Owner" ? "badge-yellow" : "badge-blue"}`}>{a.role}</span></td>
                  <td><span className={`badge ${a.isActive ? "badge-green" : "badge-gray"}`}>{a.isActive ? "Active" : "Inactive"}</span></td>
                  <td>
                    <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                      {a.id !== currentId && (
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(a)}>
                          {a.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      {a.id !== currentId && (
                        <button className="btn btn-danger btn-sm" onClick={() => remove(a)}>Delete</button>
                      )}
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
            <div className="modal-title">New Admin</div>
            <form onSubmit={save}>
              <div className="form-group"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus /></div>
              <div className="form-group"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></div>
              <div className="form-group"><label>Display Name</label><input value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="Admin">Admin</option>
                  <option value="Owner">Owner</option>
                </select>
              </div>
              {error && <p className="error-msg mb-4">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating…" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
