import { useState, useEffect } from "react";
import { Card, Pill } from "../components/ui";
import { pct } from "../utils";
import { RAG_COLOR } from "../theme";
import { ROLES } from "../roles";
import { createUser, updateUser, resetUserPassword, deleteUser, fetchSettings, updateSettings } from "../api";

function NewUserForm({ onSaved, onCancel }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("VAS Engineer");
  const [accessLevel, setAccessLevel] = useState("engineer");
  const [capacityPct, setCapacityPct] = useState(1.0);
  const [skills, setSkills] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !password.trim()) return;
    setSaving(true);
    try {
      const user = await createUser({
        name: name.trim(),
        role,
        accessLevel,
        capacityPct: Number(capacityPct),
        skills: skills || null,
        isManager: accessLevel === "manager" || accessLevel === "admin",
        password,
      });
      onSaved(user);
    } catch (err) {
      alert("Couldn't create the user — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 rounded bg-sidebar border border-default space-y-2 mb-3">
      <div>
        <div className="text-[11px] text-muted mb-1">Full name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Required" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Job title</div>
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. VAS Engineer" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Access level</div>
          <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option value="engineer">Engineer</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Capacity (0-1)</div>
          <input type="number" min="0" max="1" step="0.1" value={capacityPct} onChange={(e) => setCapacityPct(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Skills (optional)</div>
          <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. Networking, SQL" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        </div>
      </div>
      <div>
        <div className="text-[11px] text-muted mb-1">Temporary password</div>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Required — share with the new user securely" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving || !name.trim() || !password.trim()} className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50">
          {saving ? "Saving…" : "Add Team Member"}
        </button>
      </div>
    </div>
  );
}

function EditUserForm({ user, onSaved, onCancel }) {
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState(user.role || "");
  const [accessLevel, setAccessLevel] = useState(user.access_level || "engineer");
  const [capacityPct, setCapacityPct] = useState(user.capacity_pct ?? 1.0);
  const [skills, setSkills] = useState(user.skills || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const updated = await updateUser(user.id, {
        name: name.trim(),
        role,
        access_level: accessLevel,
        capacity_pct: Number(capacityPct),
        skills: skills || null,
        is_manager: accessLevel === "manager" || accessLevel === "admin",
      });
      if (newPassword.trim()) {
        await resetUserPassword(user.id, newPassword.trim());
      }
      onSaved(updated);
    } catch (err) {
      alert("Couldn't save changes — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 rounded bg-sidebar border border-default space-y-2 mb-3">
      <div>
        <div className="text-[11px] text-muted mb-1">Full name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Job title</div>
          <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Access level</div>
          <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option value="engineer">Engineer</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Capacity (0-1)</div>
          <input type="number" min="0" max="1" step="0.1" value={capacityPct} onChange={(e) => setCapacityPct(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Skills</div>
          <input value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        </div>
      </div>
      <div>
        <div className="text-[11px] text-muted mb-1">Reset password (optional)</div>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current password" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving || !name.trim()} className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default function Admin({ users, resources }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [settings, setSettings] = useState(null);
  const [editingThresholds, setEditingThresholds] = useState(false);
  const [thresholdDraft, setThresholdDraft] = useState(null);
  const [savingThresholds, setSavingThresholds] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => alert("Couldn't load settings — check the backend is running."));
  }, []);

  function startEditingThresholds() {
    setThresholdDraft(settings);
    setEditingThresholds(true);
  }

  async function saveThresholds() {
    setSavingThresholds(true);
    try {
      const updated = await updateSettings(thresholdDraft);
      setSettings(updated);
      setEditingThresholds(false);
    } catch (err) {
      alert("Couldn't save settings — check the backend is running.");
    } finally {
      setSavingThresholds(false);
    }
  }

  // Fall back to sane defaults while settings are still loading,
  // so the rest of the page (allocation pill colors) doesn't crash.
  const overloadedPct = settings?.overloaded_pct ?? 0.9;
  const healthyPct = settings?.healthy_pct ?? 0.7;

  const [extraUsers, setExtraUsers] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [overrides, setOverrides] = useState({});

  const allUsers = [...users, ...extraUsers]
    .filter((u) => !removedIds.includes(u.id))
    .map((u) => (overrides[u.id] ? { ...u, ...overrides[u.id] } : u));

  // Merge each user with their workload stats from `resources`,
  // matched by name (the same convention already used elsewhere
  // in this app — there's no shared id between the two lists).
  const usersWithStats = allUsers.map((u) => {
    const stat = resources.find((r) => r.name === u.name);
    return { ...u, allocated: stat?.allocated, projectsSummary: stat?.projects };
  });

  async function handleToggleActive(u) {
    try {
      const updated = await updateUser(u.id, { is_active: !u.is_active });
      setOverrides((prev) => ({ ...prev, [u.id]: { is_active: updated.is_active } }));
    } catch (err) {
      alert("Couldn't update — check the backend is running.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Permanently delete this user? This can't be undone. If they have any tasks or projects linked, deactivate instead.")) return;
    try {
      await deleteUser(id);
      setRemovedIds((prev) => [...prev, id]);
    } catch (err) {
      const msg = err.message.includes("409")
        ? "This user still has tasks, projects, or other records linked — deactivate them instead, or reassign their work first."
        : "Couldn't delete — check the backend is running.";
      alert(msg);
    }
  }

  return (
    <div className="space-y-5 max-w-[1000px]">
      <h1 className="text-xl font-bold">Administration</h1>
      <p className="text-[13px] text-muted">Visible only to Administrators.</p>

      <Card
        title="Users & Team Members"
        subtitle="Real accounts from the database"
        right={
          <button onClick={() => { setShowForm((s) => !s); setEditingId(null); }} className="text-[11px] font-medium text-accent">
            {showForm ? "Cancel" : "+ Add Member"}
          </button>
        }
      >
        {showForm && (
          <NewUserForm
            onCancel={() => setShowForm(false)}
            onSaved={(user) => {
              setExtraUsers((prev) => [...prev, user]);
              setShowForm(false);
            }}
          />
        )}

        <div className="space-y-2">
          {usersWithStats.map((u) => (
            editingId === u.id ? (
              <EditUserForm
                key={u.id}
                user={u}
                onCancel={() => setEditingId(null)}
                onSaved={(updated) => {
                  setOverrides((prev) => ({ ...prev, [u.id]: updated }));
                  setEditingId(null);
                }}
              />
            ) : (
              <div key={u.id} className={`flex items-center justify-between gap-3 p-2.5 rounded bg-sidebar border border-default ${u.is_active === false ? "opacity-50" : ""}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium">{u.name}</span>
                    {u.is_active === false && <Pill color={RAG_COLOR.Red}>Deactivated</Pill>}
                    {u.access_level && <span className="text-[10.5px] text-muted uppercase tracking-wide">{u.access_level}</span>}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {u.role}
                    {u.allocated !== undefined && ` · ${pct(u.allocated)} allocated`}
                    {u.projectsSummary && ` · ${u.projectsSummary}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {u.allocated !== undefined && (
                    <Pill color={u.allocated >= overloadedPct ? RAG_COLOR.Red : u.allocated >= healthyPct ? RAG_COLOR.Amber : RAG_COLOR.Green}>
                      {pct(u.allocated)}
                    </Pill>
                  )}
                  <button onClick={() => { setEditingId(u.id); setShowForm(false); }} className="text-[11px] text-muted hover:underline">Edit</button>
                  <button onClick={() => handleToggleActive(u)} className="text-[11px] text-muted hover:underline">
                    {u.is_active === false ? "Reactivate" : "Deactivate"}
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="text-[11px] text-red hover:underline">Delete</button>
                </div>
              </div>
            )
          ))}
          {usersWithStats.length === 0 && <div className="text-[12px] text-muted">No users loaded yet.</div>}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card
          title="RAG Thresholds"
          subtitle="Controls when a project is auto-flagged Amber or Red based on delay"
          right={!editingThresholds && (
            <button onClick={startEditingThresholds} className="text-[11px] font-medium text-accent">Edit</button>
          )}
        >
          {!settings ? (
            <div className="text-[12px] text-muted">Loading…</div>
          ) : editingThresholds ? (
            <div className="space-y-2 text-[12.5px]">
              <div className="flex items-center justify-between p-2 rounded bg-sidebar border border-default gap-2">
                <span className="text-tertiary">Red if delay ≥</span>
                <div className="flex items-center gap-1">
                  <input type="number" min="0" value={thresholdDraft.red_delay_days} onChange={(e) => setThresholdDraft((d) => ({ ...d, red_delay_days: Number(e.target.value) }))} className="w-16 bg-input border border-default rounded px-2 py-1 text-right" />
                  <span className="text-muted">days</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-sidebar border border-default gap-2">
                <span className="text-tertiary">Amber if delay ≥</span>
                <div className="flex items-center gap-1">
                  <input type="number" min="0" value={thresholdDraft.amber_delay_days} onChange={(e) => setThresholdDraft((d) => ({ ...d, amber_delay_days: Number(e.target.value) }))} className="w-16 bg-input border border-default rounded px-2 py-1 text-right" />
                  <span className="text-muted">days</span>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => setEditingThresholds(false)} className="text-[11px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
                <button onClick={saveThresholds} disabled={savingThresholds} className="text-[11px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50">{savingThresholds ? "Saving…" : "Save"}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-[12.5px]">
              <div className="flex justify-between p-2 rounded bg-sidebar border border-default"><span className="text-tertiary">Red if delay ≥</span><span>{settings.red_delay_days} days</span></div>
              <div className="flex justify-between p-2 rounded bg-sidebar border border-default"><span className="text-tertiary">Amber if delay ≥</span><span>{settings.amber_delay_days} days</span></div>
            </div>
          )}
        </Card>
        <Card
          title="Utilization Thresholds"
          subtitle="Controls when a team member is flagged overloaded on the Team Board"
          right={!editingThresholds && (
            <button onClick={startEditingThresholds} className="text-[11px] font-medium text-accent">Edit</button>
          )}
        >
          {!settings ? (
            <div className="text-[12px] text-muted">Loading…</div>
          ) : editingThresholds ? (
            <div className="space-y-2 text-[12.5px]">
              <div className="flex items-center justify-between p-2 rounded bg-sidebar border border-default gap-2">
                <span className="text-tertiary">Overloaded above</span>
                <div className="flex items-center gap-1">
                  <input type="number" min="0" max="100" value={Math.round(thresholdDraft.overloaded_pct * 100)} onChange={(e) => setThresholdDraft((d) => ({ ...d, overloaded_pct: Number(e.target.value) / 100 }))} className="w-16 bg-input border border-default rounded px-2 py-1 text-right" />
                  <span className="text-muted">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-sidebar border border-default gap-2">
                <span className="text-tertiary">Healthy below</span>
                <div className="flex items-center gap-1">
                  <input type="number" min="0" max="100" value={Math.round(thresholdDraft.healthy_pct * 100)} onChange={(e) => setThresholdDraft((d) => ({ ...d, healthy_pct: Number(e.target.value) / 100 }))} className="w-16 bg-input border border-default rounded px-2 py-1 text-right" />
                  <span className="text-muted">%</span>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => setEditingThresholds(false)} className="text-[11px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
                <button onClick={saveThresholds} disabled={savingThresholds} className="text-[11px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50">{savingThresholds ? "Saving…" : "Save"}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-[12.5px]">
              <div className="flex justify-between p-2 rounded bg-sidebar border border-default"><span className="text-tertiary">Overloaded above</span><span>{pct(settings.overloaded_pct)}</span></div>
              <div className="flex justify-between p-2 rounded bg-sidebar border border-default"><span className="text-tertiary">Healthy below</span><span>{pct(settings.healthy_pct)}</span></div>
            </div>
          )}
        </Card>
        <Card title="Roles & Permission Matrix" className="col-span-2">
          <table className="w-full text-[12px]">
            <thead><tr className="text-muted uppercase text-[10.5px] border-b border-default"><th className="text-left py-2">Role</th><th className="text-left py-2">Permissions</th></tr></thead>
            <tbody>
              {Object.entries(ROLES).map(([k, v]) => (
                <tr key={k} className="border-b border-default last:border-0">
                  <td className="py-2 font-medium">{v.label}</td>
                  <td className="py-2 text-tertiary text-[11px]">{v.perms.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
