import { useState, useEffect } from "react";
import { Send, Lock, X, Pencil, Trash2, Plus } from "lucide-react";
import { Card, Pill, MineToggle } from "../components/ui";
import { fmtDate } from "../utils";
import { RAG_COLOR } from "../theme";
import { hasPerm } from "../roles";
import {
  createVendor,
  updateVendor,
  deleteVendor,
  fetchUsers,
  fetchProjects,
} from "../api";

export default function Vendors({
  role,
  vendors,
  currentUser,
  currentUserId,
}) {
  const [items, setItems] = useState(vendors);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [mineOnly, setMineOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draftFor, setDraftFor] = useState(null);

  // Fetch users & projects on mount
  useEffect(() => {
    fetchUsers().then(setUsers).catch(console.error);
    fetchProjects().then(setProjects).catch(console.error);
  }, []);

  const canManage = hasPerm(role, "*") || hasPerm(role, "manage_projects");

  const shown = mineOnly
    ? items.filter((v) => v.owner === currentUser)
    : items;

  const overdue = shown.filter((v) => v.status === "Overdue");
  const open = shown.filter((v) => v.status === "Open");

  function canEdit(v) {
    return canManage || v.owner === currentUser || v.ownerId === currentUserId;
  }

  function handleCreated(v) {
    setItems((prev) => [normalizeVendor(v, users, projects), ...prev]);
    setShowForm(false);
  }

  function handleUpdated(v) {
    setItems((prev) =>
      prev.map((x) =>
        x.id === v.id ? normalizeVendor(v, users, projects) : x
      )
    );
    setEditingId(null);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this vendor action?")) return;
    try {
      await deleteVendor(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("Couldn't delete — check the backend.");
    }
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Vendor Management</h1>
        <div className="flex items-center gap-3">
          <MineToggle
            active={mineOnly}
            onToggle={() => setMineOnly((v) => !v)}
            label="My Actions"
          />
          <Pill color={overdue.length > 0 ? RAG_COLOR.Red : RAG_COLOR.Green}>
            {overdue.length} overdue
          </Pill>
          {canManage && (
            <button
              onClick={() => {
                setShowForm((s) => !s);
                setEditingId(null);
              }}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium"
            >
              <Plus size={13} />
              {showForm ? "Close" : "New Vendor"}
            </button>
          )}
        </div>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <VendorForm
          users={users}
          projects={projects}
          currentUserId={currentUserId}
          onSave={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* MAIN LIST */}
      <Card
        title="Vendor Action Tracker"
        subtitle="Pending actions and SLA status"
      >
        {shown.length === 0 && (
          <div className="text-[12px] text-muted">No vendor actions to show.</div>
        )}

        <div className="space-y-2">
          {shown.map((v) =>
            editingId === v.id ? (
              <VendorForm
                key={v.id}
                initial={v}
                users={users}
                projects={projects}
                currentUserId={currentUserId}
                onSave={handleUpdated}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <VendorRow
                key={v.id}
                v={v}
                canEdit={canEdit(v)}
                canDraft={canManage}
                onEdit={() => setEditingId(v.id)}
                onDelete={() => handleDelete(v.id)}
                onDraft={() => setDraftFor(v)}
              />
            )
          )}
        </div>
      </Card>

      {/* SUMMARY CARDS */}
      {role !== "engineer" && (
        <div className="grid grid-cols-2 gap-4">
          <Card title="Overdue Actions">
            <div className="text-[12px] space-y-2">
              {overdue.length === 0 && (
                <div className="text-muted">No overdue actions. Great!</div>
              )}
              {overdue.map((v) => (
                <div
                  key={v.id}
                  className="p-2 rounded bg-input border border-default"
                >
                  <div className="font-medium">
                    {v.vendor} — {v.project}
                  </div>
                  <div className="text-muted">{v.action}</div>
                  <div className="text-red text-[11px] mt-1">
                    {v.daysOpen} days overdue
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Open Actions">
            <div className="text-[12px] space-y-2">
              {open.length === 0 && (
                <div className="text-muted">No open actions.</div>
              )}
              {open.map((v) => (
                <div
                  key={v.id}
                  className="p-2 rounded bg-input border border-default"
                >
                  <div className="font-medium">
                    {v.vendor} — {v.project}
                  </div>
                  <div className="text-muted">{v.action}</div>
                  <div className="text-amber text-[11px] mt-1">
                    Due {fmtDate(v.due)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {draftFor && (
        <VendorDraftModal v={draftFor} onClose={() => setDraftFor(null)} />
      )}
    </div>
  );
}

/* =========================================================
   VENDOR ROW
   ========================================================= */
function VendorRow({ v, canEdit, canDraft, onEdit, onDelete, onDraft }) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded bg-sidebar border border-default">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-medium">{v.vendor}</span>
          <Pill
            color={
              v.status === "Overdue"
                ? RAG_COLOR.Red
                : v.status === "Open"
                ? RAG_COLOR.Amber
                : RAG_COLOR.Green
            }
          >
            {v.status}
          </Pill>
        </div>
        <div className="text-[11px] text-muted mt-1">{v.project}</div>
        <div className="text-[12px] text-secondary mt-1">{v.action}</div>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-2">
        <div>
          <div className="text-[11px] text-muted">Owner</div>
          <div className="text-[12px] font-medium">{v.owner}</div>
          <div className="text-[11px] text-muted mt-1">
            Due {fmtDate(v.due)}
          </div>
          {v.daysOpen > 0 && (
            <div className="text-[11px] text-red font-medium">
              {v.daysOpen} days open
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button
                onClick={onEdit}
                className="text-[11px] text-accent hover:underline flex items-center gap-1"
              >
                <Pencil size={11} /> Edit
              </button>
              <button
                onClick={onDelete}
                className="text-[11px] text-red hover:underline flex items-center gap-1"
              >
                <Trash2 size={11} /> Delete
              </button>
            </>
          )}
          {canDraft && (
            <button
              onClick={onDraft}
              className="text-[11px] font-medium bg-input border border-default px-2.5 py-1.5 rounded flex items-center gap-1"
            >
              <Send size={11} /> Draft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   VENDOR FORM
   ========================================================= */
function VendorForm({ initial, users, projects, currentUserId, onSave, onCancel }) {
  const isEdit = !!initial;

  const [vendorName, setVendorName] = useState(initial?.vendor ?? "");
  const [projectId, setProjectId] = useState(
    String(initial?.projectId ?? initial?.project_id ?? "")
  );
  const [pendingAction, setPendingAction] = useState(
    initial?.action ?? initial?.pending_action ?? ""
  );
  const [ownerId, setOwnerId] = useState(
    String(initial?.ownerId ?? initial?.owner_id ?? currentUserId ?? "")
  );
  const [dueDate, setDueDate] = useState(
    initial?.due ?? initial?.due_date ?? initial?.dueDate ?? ""
  );
  const [daysOpen, setDaysOpen] = useState(
    initial?.daysOpen ?? initial?.days_open ?? 0
  );
  const [status, setStatus] = useState(initial?.status ?? "Open");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!vendorName.trim()) return;

    const payload = {
      vendorName: vendorName.trim(),
      projectId: projectId ? Number(projectId) : null,
      pendingAction: pendingAction.trim() || null,
      ownerId: ownerId ? Number(ownerId) : null,
      dueDate: dueDate || null,
      daysOpen: Number(daysOpen) || 0,
      status,
    };

    setSaving(true);
    try {
      const result = isEdit
        ? await updateVendor(initial.id, payload)
        : await createVendor(payload);
      onSave(result);
    } catch (err) {
      console.error(err);
      alert(isEdit ? "Couldn't update vendor." : "Couldn't create vendor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded bg-sidebar border border-default space-y-3 mb-2"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-muted mb-1">
            Vendor name *
          </label>
          <input
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] text-muted mb-1">Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
          >
            <option value="">— Select project —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-1">
          Pending action
        </label>
        <input
          value={pendingAction}
          onChange={(e) => setPendingAction(e.target.value)}
          className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] text-muted mb-1">Owner</label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
          >
            <option value="">— Select owner —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-muted mb-1">
            Due date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-[11px] text-muted mb-1">
            Days open
          </label>
          <input
            type="number"
            min={0}
            value={daysOpen}
            onChange={(e) => setDaysOpen(e.target.value)}
            className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
        >
          <option>Open</option>
          <option>Overdue</option>
          <option>Closed</option>
          <option>Blocked</option>
        </select>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !vendorName.trim()}
          className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Vendor"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   NORMALIZE
   ========================================================= */
function normalizeVendor(v, users, projects) {
  const ownerUser = users.find((u) => u.id === (v.owner_id ?? v.ownerId));
  const proj = projects.find((p) => p.id === (v.project_id ?? v.projectId));

  return {
    id: v.id,
    vendor: v.vendor_name ?? v.vendorName ?? v.vendor,
    project: proj?.name ?? v.project ?? v.project_name ?? "—",
    projectId: v.project_id ?? v.projectId,
    action: v.pending_action ?? v.pendingAction ?? v.action,
    owner: ownerUser?.name ?? v.owner ?? v.owner_name ?? "—",
    ownerId: v.owner_id ?? v.ownerId,
    due: v.due_date ?? v.dueDate ?? v.due,
    daysOpen: v.days_open ?? v.daysOpen ?? v.days_open,
    status: v.status,
  };
}

/* =========================================================
   DRAFT MODAL
   ========================================================= */
function VendorDraftModal({ v, onClose }) {
  const draft = `Subject: Follow-up — ${v.action} (${v.project})

Hi ${v.vendor} team,

This is a follow-up on the pending action "${v.action}" for ${v.project}, originally due ${fmtDate(v.due)}. This item has now been open for ${v.daysOpen} days and is affecting the project's delivery timeline.

Could you please provide an updated status or completion date by end of day tomorrow?

Thanks,
${v.owner}
Ooredoo VAS Team`;
  return (
    <div
      className="fixed inset-0 overlay-dim flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-[520px] bg-panel border border-default rounded-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[14px]">
            Vendor Follow-up — Draft
          </h3>
          <button onClick={onClose}>
            <X size={16} className="text-muted" />
          </button>
        </div>
        <div className="bg-input border border-default rounded p-3 text-[12px] text-secondary whitespace-pre-wrap font-mono">
          {draft}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[11px] text-muted">
          <Lock size={12} /> Requires human review, edit and explicit approval
          before sending. No message is sent automatically.
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="text-[12px] px-3 py-1.5 rounded border border-default text-muted"
          >
            Discard
          </button>
          <button
            className="text-[12px] px-3 py-1.5 rounded"
            style={{
              background: "var(--bg-accent)",
              color: "var(--text-onaccent)",
            }}
          >
            Edit & Approve (not wired)
          </button>
        </div>
      </div>
    </div>
  );
}
