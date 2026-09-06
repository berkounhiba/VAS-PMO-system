import { useState } from "react";
import { Card, Pill, MineToggle } from "../components/ui";
import { fmtDate, pct, taskStatusKey, TASK_STATUS_COLORS } from "../utils";
import { hasPerm } from "../roles";
import { createTask, updateTask, deleteTask } from "../api";

const STATUS_CYCLE = ["Not Started", "In Progress", "Blocked", "Done"];

function Field({ label, children }) {
  return (
    <div className="flex-1">
      <div className="text-[11px] text-muted mb-1">{label}</div>
      {children}
    </div>
  );
}

function NewTaskForm({ projects, users, onSaved, onCancel }) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dependency, setDependency] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const task = await createTask({
        title: title.trim(),
        project_id: projectId || null,
        assignee_id: assigneeId || null,
        priority,
        status: "Not Started",
        start_date: startDate || null,
        due_date: dueDate || null,
        progress: 0,
        dependency: dependency || null,
      });
      onSaved(task);
    } catch (err) {
      alert("Couldn't create the task — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 rounded bg-sidebar border border-default space-y-2 mb-3">
      <Field label="Task title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title (required)"
          className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none"
        />
      </Field>
      <div className="flex gap-2">
        <Field label="Project">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option value="">No project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Assignee">
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
      </div>
      <div className="flex gap-2">
        <Field label="Priority">
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
        </Field>
        <Field label="Dependency note">
          <input value={dependency} onChange={(e) => setDependency(e.target.value)} placeholder="Optional" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        </Field>
      </div>
      <div className="flex gap-2">
        <Field label="Start date">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </Field>
        <Field label="Due date">
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </Field>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium">
          {saving ? "Saving…" : "Create Task"}
        </button>
      </div>
    </div>
  );
}

function EditTaskForm({ task, projects, users, onSaved, onCancel }) {
  const [title, setTitle] = useState(task.task || "");
  const [projectId, setProjectId] = useState(task.projectId || "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || "");
  const [priority, setPriority] = useState(task.priority || "Medium");
  const [status, setStatus] = useState(task.status || "Not Started");
  const [progress, setProgress] = useState(task.progress ?? 0);
  const [startDate, setStartDate] = useState(task.start?.slice(0, 10) || "");
  const [dueDate, setDueDate] = useState(task.finish?.slice(0, 10) || "");
  const [dependency, setDependency] = useState(task.dependency || "");
  const [comments, setComments] = useState(task.comments || "");
  const [saving, setSaving] = useState(false);

  function handleStatusChange(newStatus) {
    setStatus(newStatus);
    // Done always means 100%, Not Started always means 0%.
    // In Progress/Blocked leave whatever progress is already set.
    if (newStatus === "Done") setProgress(1);
    else if (newStatus === "Not Started") setProgress(0);
  }

  function handleProgressChange(newProgress) {
    setProgress(newProgress);
    const p = Number(newProgress);
    // Mirror of the rule above, driven from the slider instead of
    // the dropdown. Blocked is never touched automatically.
    if (status === "Blocked") return;
    if (p >= 1) setStatus("Done");
    else if (p <= 0) setStatus("Not Started");
    else if (status === "Done" || status === "Not Started") setStatus("In Progress");
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const updated = await updateTask(task.id, {
        title: title.trim(),
        project_id: projectId || null,
        assignee_id: assigneeId || null,
        priority,
        status,
        progress: Number(progress),
        start_date: startDate || null,
        due_date: dueDate || null,
        dependency: dependency || null,
        comments: comments || null,
      });
      onSaved(updated);
    } catch (err) {
      alert("Couldn't save changes — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  const progressLocked = status === "Done" || status === "Not Started";

  return (
    <div className="p-4 rounded bg-sidebar border border-default space-y-2 mb-3">
      <Field label="Task title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title (required)"
          className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none"
        />
      </Field>
      <div className="flex gap-2">
        <Field label="Project">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option value="">No project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Assignee">
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
      </div>
      <div className="flex gap-2">
        <Field label="Status">
          <select value={status} onChange={(e) => handleStatusChange(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option>Not Started</option><option>In Progress</option><option>Blocked</option><option>Done</option>
          </select>
        </Field>
        <Field label="Priority">
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
        </Field>
      </div>
      <Field label={`Progress ${progressLocked ? "(locked by status)" : ""}`}>
        <div className="flex items-center gap-3">
          <input
            type="range" min="0" max="1" step="0.05"
            value={progress}
            disabled={progressLocked}
            onChange={(e) => handleProgressChange(e.target.value)}
            className="flex-1 disabled:opacity-40"
          />
          <span className="text-[11px] text-tertiary w-10 text-right">{Math.round(Number(progress) * 100)}%</span>
        </div>
      </Field>
      <Field label="Dependency note">
        <input value={dependency} onChange={(e) => setDependency(e.target.value)} placeholder="Optional" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      </Field>
      <Field label="Comments">
        <input value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Optional" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      </Field>
      <div className="flex gap-2">
        <Field label="Start date">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </Field>
        <Field label="Due date">
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </Field>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default function Tasks({ tasks, projects, users, role, currentUser, onCycleStatus, onTaskCreated, onTaskUpdated, onTaskDeleted }) {
  const [mineOnly, setMineOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const canManage = hasPerm(role, "*") || hasPerm(role, "manage_tasks");

  const shown = mineOnly ? tasks.filter((t) => t.owner === currentUser) : tasks;

  async function handleDelete(id) {
    if (!confirm("Delete this task? This can't be undone.")) return;
    try {
      await deleteTask(id);
      onTaskDeleted(id);
    } catch (err) {
      alert("Couldn't delete — check the backend is running.");
    }
  }

  return (
    <div className="space-y-4 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tasks</h1>
        <div className="flex items-center gap-2">
          <MineToggle active={mineOnly} onToggle={() => setMineOnly((v) => !v)} label="My Tasks" />
          {canManage && (
            <button onClick={() => setShowForm((s) => !s)} className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium">
              {showForm ? "Close" : "+ Add Task"}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <NewTaskForm
          projects={projects}
          users={users}
          onCancel={() => setShowForm(false)}
          onSaved={(task) => { onTaskCreated(task); setShowForm(false); }}
        />
      )}

      <Card>
        <div className="space-y-2">
          {shown.length === 0 && <div className="text-[12px] text-muted">No tasks to show.</div>}
          {shown.map((t) => {
            const s = TASK_STATUS_COLORS[taskStatusKey(t)];
            const canEditStatus = t.owner === currentUser;
            const canEditDetails = canManage || canEditStatus; // assignee can edit their own task's details too, not just status

            if (editingId === t.id) {
              return (
                <EditTaskForm
                  key={t.id}
                  task={t}
                  projects={projects}
                  users={users}
                  onCancel={() => setEditingId(null)}
                  onSaved={(updated) => { onTaskUpdated(updated); setEditingId(null); }}
                />
              );
            }

            return (
              <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded bg-sidebar border border-default">
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium truncate">{t.task}</div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {t.project} · {t.owner} · {t.priority} · due {fmtDate(t.finish)} · {pct(t.progress)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canEditStatus ? (
                    <button
                      onClick={() => {
                        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status) + 1) % STATUS_CYCLE.length];
                        onCycleStatus(t.id, next);
                      }}
                      title="Click to advance status"
                    >
                      <Pill color={s.border}>{t.status}</Pill>
                    </button>
                  ) : (
                    <Pill color={s.border}>{t.status}</Pill>
                  )}
                  {canEditDetails && (
                    <button onClick={() => setEditingId(t.id)} className="text-[11px] text-accent hover:underline">
                      Edit
                    </button>
                  )}
                  {canManage && (
                    <button onClick={() => handleDelete(t.id)} className="text-[11px] text-red hover:underline">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
