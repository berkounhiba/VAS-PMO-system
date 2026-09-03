import { useState } from "react";
import { Card, KpiCard, Pill, Empty, RowLine, healthColor, MineToggle } from "../components/ui";
import { fmtDate, pct } from "../utils";
import { RAG_COLOR } from "../theme";
import {
  createProject, updateProject, deleteProject,
  createMilestone, updateMilestone, deleteMilestone,
  createTask, updateTask, deleteTask,
  createRisk, updateRisk, deleteRisk,
  createDependency, updateDependency, deleteDependency,
  createUatSit, updateUatSit, deleteUatSit,
  createGolive, updateGolive, deleteGolive,
} from "../api";

function NewProjectForm({ users, onSaved, onCancel }) {
  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState("IT");
  const [domain, setDomain] = useState("");
  const [priority, setPriority] = useState("");
  const [leadId, setLeadId] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedGoLive, setPlannedGoLive] = useState("");
  const [forecastGoLive, setForecastGoLive] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const project = await createProject({
        name, projectType, domain, priority: priority || "Medium", leadId: leadId || null,
        plannedStart: plannedStart || null, plannedGoLive: plannedGoLive || null, forecastGoLive: forecastGoLive || null,
      });
      const leadName = users.find((u) => u.id === leadId)?.name || "Unassigned";
      onSaved(project, leadName);
    } catch (err) {
      alert("Couldn't create the project — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 rounded bg-sidebar border border-default space-y-2 mb-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name (required)"
        className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none"
      />
      <div className="flex gap-2">
        <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option value="IT">IT</option>
          <option value="Business">Business</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option value="" disabled>Select priority…</option>
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
      </div>
      <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
        <option value="">Assign to… (optional)</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name} — {u.role}</option>
        ))}
      </select>
      <input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Domain (optional)"
        className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none"
      />
      <div>
        <div className="text-[11px] text-muted mb-1">Planned start</div>
        <input type="date" value={plannedStart} onChange={(e) => setPlannedStart(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Planned Go-Live</div>
          <input type="date" value={plannedGoLive} onChange={(e) => setPlannedGoLive(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Forecast Go-Live</div>
          <input type="date" value={forecastGoLive} onChange={(e) => setForecastGoLive(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium">
          {saving ? "Saving…" : "Create Project"}
        </button>
      </div>
    </div>
  );
}

// Not authoritative — just a starting-point suggestion the PM can override,
// since real project health sometimes needs judgment a formula can't capture
// (vendor risk, quality concerns, etc. with zero schedule slip).
function suggestHealth(delayDays, status) {
  const d = Number(delayDays) || 0;
  if (status === "Blocked" || d >= 10) return "Red";
  if (status === "Delayed" || d > 0) return "Amber";
  return "Green";
}

function EditProjectForm({ project, users, onSaved, onCancel }) {
  const [status, setStatus] = useState(project.status || "On Track");
  const [health, setHealth] = useState(project.health || "Green");
  const [priority, setPriority] = useState(project.priority || "Medium");
  const [progress, setProgress] = useState(project.progress ?? 0);
  const [delayDays, setDelayDays] = useState(project.delayDays ?? 0);
  const [blocker, setBlocker] = useState(project.blocker || "");
  const [nextAction, setNextAction] = useState(project.nextAction || "");
  const [leadId, setLeadId] = useState(project.leadId || "");
  const [plannedStart, setPlannedStart] = useState(project.plannedStart?.slice(0, 10) || "");
  const [plannedGoLive, setPlannedGoLive] = useState(project.plannedFinish?.slice(0, 10) || "");
  const [forecastGoLive, setForecastGoLive] = useState(project.forecastFinish?.slice(0, 10) || "");
  const [saving, setSaving] = useState(false);

  const suggested = suggestHealth(delayDays, status);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateProject(project.id, {
        status, health, priority, progress: Number(progress), delay_days: Number(delayDays) || 0,
        blocker, next_action: nextAction, lead_id: leadId || null,
        planned_start: plannedStart || null, planned_go_live: plannedGoLive || null, forecast_go_live: forecastGoLive || null,
      });
      const leadName = users.find((u) => u.id === leadId)?.name || "Unassigned";
      onSaved(updated, leadName);
    } catch (err) {
      alert("Couldn't save changes — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Edit Project">
      <div className="space-y-2">
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option>On Track</option><option>Delayed</option><option>Blocked</option><option>On Hold</option><option>Not Started</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option value="" disabled>Select priority…</option>
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
          <input type="number" min="0" max="1" step="0.05" value={progress} onChange={(e) => setProgress(e.target.value)} placeholder="Progress (0-1)" className="w-28 bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
          <input type="number" min="0" value={delayDays} onChange={(e) => setDelayDays(e.target.value)} placeholder="Delay (days)" className="w-28 bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <select value={health} onChange={(e) => setHealth(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
              <option>Green</option><option>Amber</option><option>Red</option>
            </select>
            {health !== suggested && (
              <button
                type="button"
                onClick={() => setHealth(suggested)}
                className="text-[11px] text-accent whitespace-nowrap"
                title="Health doesn't match schedule status — click to apply the suggestion"
              >
                Suggested: {suggested}
              </button>
            )}
          </div>
          <div className="text-[10.5px] text-muted mt-1">
            Health is a manual PM judgment call (matches DB behavior) — the suggestion is based on status/delay, but you can override it.
          </div>
        </div>

        <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option value="">Assign to…</option>
          {users.map((u) => (<option key={u.id} value={u.id}>{u.name} — {u.role}</option>))}
        </select>

        <div className="flex gap-2">
          <div className="flex-1">
            <div className="text-[11px] text-muted mb-1">Planned start</div>
            <input type="date" value={plannedStart} onChange={(e) => setPlannedStart(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-muted mb-1">Planned Go-Live</div>
            <input type="date" value={plannedGoLive} onChange={(e) => setPlannedGoLive(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-muted mb-1">Forecast Go-Live</div>
            <input type="date" value={forecastGoLive} onChange={(e) => setForecastGoLive(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
          </div>
        </div>

        <input value={blocker} onChange={(e) => setBlocker(e.target.value)} placeholder="Current blocker" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="Next action" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium">{saving ? "Saving…" : "Save Changes"}</button>
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   MILESTONE form — used for both create and edit
============================================================= */
function MilestoneForm({ projectId, users, initial, onSaved, onCancel }) {
  const [title, setTitle] = useState(initial?.name || "");
  const [ownerId, setOwnerId] = useState(initial?.ownerId || "");
  const [dueDate, setDueDate] = useState(initial?.planned?.slice(0, 10) || "");
  const [forecastDate, setForecastDate] = useState(initial?.forecast?.slice(0, 10) || "");
  const [status, setStatus] = useState(initial?.status || "Not Started");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        saved = await updateMilestone(initial.id, {
          title, owner_id: ownerId || null, due_date: dueDate || null,
          forecast_date: forecastDate || null, status,
        });
      } else {
        saved = await createMilestone({
          title, projectId, ownerId: ownerId || null, dueDate: dueDate || null,
          forecastDate: forecastDate || null, status,
        });
      }
      const ownerName = users.find((u) => u.id === ownerId)?.name || "—";
      onSaved(saved, ownerName);
    } catch (err) {
      alert("Couldn't save the milestone — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3 rounded bg-sidebar border border-default space-y-2 mb-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone title (required)" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      <div className="flex gap-2">
        <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option value="">Owner…</option>
          {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option>Not Started</option><option>On Track</option><option>Blocked</option><option>Delayed</option><option>Done</option>
        </select>
      </div>
      <div className="flex gap-2">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        <input type="date" value={forecastDate} onChange={(e) => setForecastDate(e.target.value)} placeholder="Forecast" className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[11.5px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving || !title.trim()} className="text-[11.5px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Milestone"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   TASK form — used for both create and edit
============================================================= */
function TaskForm({ projectId, users, initial, onSaved, onCancel }) {
  const [title, setTitle] = useState(initial?.task || "");
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId || "");
  const [status, setStatus] = useState(initial?.status || "Not Started");
  const [priority, setPriority] = useState(initial?.priority || "Medium");
  const [dueDate, setDueDate] = useState(initial?.finish?.slice(0, 10) || "");
  const [progress, setProgress] = useState(initial?.progress ?? 0);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        saved = await updateTask(initial.id, {
          title, assignee_id: assigneeId || null, status, priority, due_date: dueDate || null,
          progress: progress === "" ? 0 : Number(progress),
        });
      } else {
        saved = await createTask({
          title, projectId, assigneeId: assigneeId || null, status, priority, dueDate: dueDate || null,
        });
      }
      const ownerName = users.find((u) => u.id === assigneeId)?.name || "—";
      onSaved(saved, ownerName);
    } catch (err) {
      alert("Couldn't save the task — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3 rounded bg-sidebar border border-default space-y-2 mb-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title (required)" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      <div className="flex gap-2">
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option value="">Assignee…</option>
          {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option>Not Started</option><option>In Progress</option><option>Blocked</option><option>Done</option>
        </select>
      </div>
      <div className="flex gap-2">
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
      </div>
      {isEdit && (
        <div>
          <div className="flex justify-between text-[11px] text-muted mb-1">
            <span>Progress</span>
            <span>{Math.round(Number(progress) * 100)}%</span>
          </div>
          <input
            type="range" min="0" max="1" step="0.05"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            className="w-full"
          />
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[11.5px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving || !title.trim()} className="text-[11.5px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Task"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   RISK form — used for both create and edit
============================================================= */
function RiskForm({ projectId, users, initial, onSaved, onCancel }) {
  const [description, setDescription] = useState(initial?.risk || "");
  const [severity, setSeverity] = useState(initial?.severity || "Medium");
  const [probability, setProbability] = useState(initial?.probability || "");
  const [impact, setImpact] = useState(initial?.impact || "");
  const [score, setScore] = useState(initial?.score ?? "");
  const [mitigation, setMitigation] = useState(initial?.mitigation || "");
  const [ownerId, setOwnerId] = useState(initial?.ownerId || "");
  const [status, setStatus] = useState(initial?.status || "Open");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  async function handleSave() {
    if (!description.trim()) return;
    setSaving(true);
    try {
      const payload = {
        description, severity, probability: probability || null, impact: impact || null,
        score: score === "" ? null : Number(score), mitigation: mitigation || null,
        owner_id: ownerId || null, status,
      };
      let saved;
      if (isEdit) {
        saved = await updateRisk(initial.id, payload);
      } else {
        saved = await createRisk({ ...payload, projectId, ownerId: ownerId || null });
      }
      const ownerName = users.find((u) => u.id === ownerId)?.name || "—";
      onSaved(saved, ownerName);
    } catch (err) {
      alert("Couldn't save the risk — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3 rounded bg-sidebar border border-default space-y-2 mb-2">
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Risk description (required)" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      <div className="flex gap-2">
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option>Open</option><option>Monitoring</option><option>Mitigated</option><option>Closed</option>
        </select>
      </div>
      <div className="flex gap-2">
        <input value={probability} onChange={(e) => setProbability(e.target.value)} placeholder="Probability (e.g. Low/Med/High)" className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        <input value={impact} onChange={(e) => setImpact(e.target.value)} placeholder="Impact" className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        <input type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder="Score" className="w-24 bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      </div>
      <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
        <option value="">Owner…</option>
        {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
      </select>
      <input value={mitigation} onChange={(e) => setMitigation(e.target.value)} placeholder="Mitigation plan" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[11.5px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving || !description.trim()} className="text-[11.5px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Risk"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   DEPENDENCY form — used for both create and edit
============================================================= */
function DependencyForm({ projectId, users, initial, onSaved, onCancel }) {
  const [dependsOn, setDependsOn] = useState(initial?.dependsOn || "");
  const [ownerId, setOwnerId] = useState(initial?.ownerId || "");
  const [status, setStatus] = useState(initial?.status || "Open");
  const [critical, setCritical] = useState(initial?.critical ? "Yes" : "No");
  const [targetDate, setTargetDate] = useState(initial?.target?.slice(0, 10) || "");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  async function handleSave() {
    if (!dependsOn.trim()) return;
    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        saved = await updateDependency(initial.id, {
          depends_on: dependsOn, owner_id: ownerId || null, status, critical, target_date: targetDate || null,
        });
      } else {
        saved = await createDependency({
          projectId, dependsOn, ownerId: ownerId || null, status, critical, targetDate: targetDate || null,
        });
      }
      const ownerName = users.find((u) => u.id === ownerId)?.name || "—";
      onSaved(saved, ownerName);
    } catch (err) {
      alert("Couldn't save the dependency — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3 rounded bg-sidebar border border-default space-y-2 mb-2">
      <input value={dependsOn} onChange={(e) => setDependsOn(e.target.value)} placeholder="Depends on (required)" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      <div className="flex gap-2">
        <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option value="">Owner…</option>
          {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option>Open</option><option>In Progress</option><option>Resolved</option><option>Blocked</option>
        </select>
      </div>
      <div className="flex gap-2">
        <select value={critical} onChange={(e) => setCritical(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option value="No">Not critical</option>
          <option value="Yes">Critical</option>
        </select>
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[11.5px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving || !dependsOn.trim()} className="text-[11.5px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Dependency"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SIT/UAT form — used for both create and edit
============================================================= */
function UatSitForm({ projectId, initial, onSaved, onCancel }) {
  const [module, setModule] = useState(initial?.module || "");
  const [sitPct, setSitPct] = useState(initial?.sit ?? 0);
  const [uatPct, setUatPct] = useState(initial?.uat ?? 0);
  const [openDefects, setOpenDefects] = useState(initial?.openDefects ?? 0);
  const [criticalDefects, setCriticalDefects] = useState(initial?.criticalDefects ?? 0);
  const [ready, setReady] = useState(initial?.ready ? "Yes" : "No");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  async function handleSave() {
    if (!module.trim()) return;
    setSaving(true);
    try {
      const payload = {
        module,
        sit_pct: Number(sitPct), uat_pct: Number(uatPct),
        open_defects: Number(openDefects), critical_defects: Number(criticalDefects),
        ready,
      };
      let saved;
      if (isEdit) {
        saved = await updateUatSit(initial.id, payload);
      } else {
        saved = await createUatSit({ projectId, module, sitPct: Number(sitPct), uatPct: Number(uatPct), openDefects: Number(openDefects), criticalDefects: Number(criticalDefects), ready });
      }
      onSaved(saved);
    } catch (err) {
      alert("Couldn't save the SIT/UAT record — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3 rounded bg-sidebar border border-default space-y-2 mb-2">
      <input value={module} onChange={(e) => setModule(e.target.value)} placeholder="Module name (required)" className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">SIT %</div>
          <input type="number" min="0" max="1" step="0.05" value={sitPct} onChange={(e) => setSitPct(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">UAT %</div>
          <input type="number" min="0" max="1" step="0.05" value={uatPct} onChange={(e) => setUatPct(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Open defects</div>
          <input type="number" min="0" value={openDefects} onChange={(e) => setOpenDefects(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-muted mb-1">Critical defects</div>
          <input type="number" min="0" value={criticalDefects} onChange={(e) => setCriticalDefects(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </div>
      </div>
      <select value={ready} onChange={(e) => setReady(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
        <option value="No">Not ready</option>
        <option value="Yes">Ready</option>
      </select>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[11.5px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving || !module.trim()} className="text-[11.5px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add SIT/UAT Record"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   GO-LIVE form — one row per project; create if missing, edit if exists
============================================================= */
function GoliveForm({ projectId, initial, onSaved, onCancel }) {
  const [rfc, setRfc] = useState(initial?.rfc && initial.rfc !== "—" ? initial.rfc : "");
  const [mop, setMop] = useState(initial?.mop && initial.mop !== "—" ? initial.mop : "");
  const [rollback, setRollback] = useState(initial?.rollback && initial.rollback !== "—" ? initial.rollback : "");
  const [monitoring, setMonitoring] = useState(initial?.monitoring && initial.monitoring !== "—" ? initial.monitoring : "");
  const [businessSignoff, setBusinessSignoff] = useState(initial?.businessSignoff && initial.businessSignoff !== "—" ? initial.businessSignoff : "");
  const [techSignoff, setTechSignoff] = useState(initial?.techSignoff && initial.techSignoff !== "—" ? initial.techSignoff : "");
  const [ready, setReady] = useState(initial?.ready ? "Yes" : "No");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        rfc: rfc || null, mop: mop || null, rollback: rollback || null, monitoring: monitoring || null,
        business_signoff: businessSignoff || null, technical_signoff: techSignoff || null, ready,
      };
      let saved;
      if (isEdit) {
        saved = await updateGolive(initial.id, payload);
      } else {
        saved = await createGolive({
          projectId, rfc: rfc || null, mop: mop || null, rollback: rollback || null, monitoring: monitoring || null,
          businessSignoff: businessSignoff || null, technicalSignoff: techSignoff || null, ready,
        });
      }
      onSaved(saved);
    } catch (err) {
      alert("Couldn't save Go-Live readiness — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3 rounded bg-sidebar border border-default space-y-2 mb-2">
      <div className="grid grid-cols-2 gap-2">
        <input value={rfc} onChange={(e) => setRfc(e.target.value)} placeholder="RFC status" className="bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        <input value={mop} onChange={(e) => setMop(e.target.value)} placeholder="MOP status" className="bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        <input value={rollback} onChange={(e) => setRollback(e.target.value)} placeholder="Rollback plan status" className="bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        <input value={monitoring} onChange={(e) => setMonitoring(e.target.value)} placeholder="Monitoring status" className="bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        <input value={businessSignoff} onChange={(e) => setBusinessSignoff(e.target.value)} placeholder="Business sign-off" className="bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
        <input value={techSignoff} onChange={(e) => setTechSignoff(e.target.value)} placeholder="Technical sign-off" className="bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none" />
      </div>
      <select value={ready} onChange={(e) => setReady(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
        <option value="No">Not ready for Go-Live</option>
        <option value="Yes">Ready for Go-Live</option>
      </select>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[11.5px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="text-[11.5px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Set Up Go-Live"}
        </button>
      </div>
    </div>
  );
}

function ProjectDetail({ project: p, tasks, milestones, risks, dependencies, uatSit, golive, vendors, users, canManage, onBack, onUpdated, onDeleted }) {


  const [editing, setEditing] = useState(false);

  // local add/edit/delete state per section — mirrors the pattern used
  // at the top-level Projects component for project overrides
  const [extraMilestones, setExtraMilestones] = useState([]);
  const [removedMilestoneIds, setRemovedMilestoneIds] = useState([]);
  const [milestoneOverrides, setMilestoneOverrides] = useState({});
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);

  const [extraTasks, setExtraTasks] = useState([]);
  const [removedTaskIds, setRemovedTaskIds] = useState([]);
  const [taskOverrides, setTaskOverrides] = useState({});
  const [addingTask, setAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [extraRisks, setExtraRisks] = useState([]);
  const [removedRiskIds, setRemovedRiskIds] = useState([]);
  const [riskOverrides, setRiskOverrides] = useState({});
  const [addingRisk, setAddingRisk] = useState(false);
  const [editingRiskId, setEditingRiskId] = useState(null);

  const [extraDeps, setExtraDeps] = useState([]);
  const [removedDepIds, setRemovedDepIds] = useState([]);
  const [depOverrides, setDepOverrides] = useState({});
  const [addingDep, setAddingDep] = useState(false);
  const [editingDepId, setEditingDepId] = useState(null);

  const [extraUatSit, setExtraUatSit] = useState([]);
  const [removedUatSitIds, setRemovedUatSitIds] = useState([]);
  const [uatSitOverrides, setUatSitOverrides] = useState({});
  const [addingUatSit, setAddingUatSit] = useState(false);
  const [editingUatSitId, setEditingUatSitId] = useState(null);

  const [goliveOverride, setGoliveOverride] = useState(null); // saved data replaces the prop row once set
  const [goliveDeleted, setGoliveDeleted] = useState(false);
  const [editingGolive, setEditingGolive] = useState(false);

  const pMilestones = [...milestones.filter((m) => m.project === p.name), ...extraMilestones]
    .filter((m) => !removedMilestoneIds.includes(m.id))
    .map((m) => (milestoneOverrides[m.id] ? { ...m, ...milestoneOverrides[m.id] } : m));

  const pTasks = [...tasks.filter((t) => t.project === p.name), ...extraTasks]
    .filter((t) => !removedTaskIds.includes(t.id))
    .map((t) => (taskOverrides[t.id] ? { ...t, ...taskOverrides[t.id] } : t));

  const pRisks = [...risks.filter((r) => r.project === p.name), ...extraRisks]
    .filter((r) => !removedRiskIds.includes(r.id))
    .map((r) => (riskOverrides[r.id] ? { ...r, ...riskOverrides[r.id] } : r));

  const deps = [...dependencies.filter((d) => d.project === p.name), ...extraDeps]
    .filter((d) => !removedDepIds.includes(d.id))
    .map((d) => (depOverrides[d.id] ? { ...d, ...depOverrides[d.id] } : d));

  const uatsit = [...uatSit.filter((u) => u.project === p.name), ...extraUatSit]
    .filter((u) => !removedUatSitIds.includes(u.id))
    .map((u) => (uatSitOverrides[u.id] ? { ...u, ...uatSitOverrides[u.id] } : u));

  const goliveRow = goliveDeleted ? null : (goliveOverride || golive.find((g) => g.project === p.name));
  const vendorActions = vendors.filter((v) => v.project === p.name);

  async function handleDelete() {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await deleteProject(p.id);
      onDeleted(p.id);
      onBack();
    } catch (err) {
      const msg = err.message.includes("409")
        ? "This project still has tasks, milestones, or risks linked to it — remove those first."
        : "Couldn't delete — check the backend is running.";
      alert(msg);
    }
  }

  async function handleDeleteMilestone(id) {
    if (!confirm("Delete this milestone?")) return;
    try {
      await deleteMilestone(id);
      setRemovedMilestoneIds((prev) => [...prev, id]);
    } catch (err) {
      alert("Couldn't delete the milestone — check the backend is running.");
    }
  }

  async function handleDeleteTask(id) {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      setRemovedTaskIds((prev) => [...prev, id]);
    } catch (err) {
      alert("Couldn't delete the task — check the backend is running.");
    }
  }

  async function handleDeleteRisk(id) {
    if (!confirm("Delete this risk?")) return;
    try {
      await deleteRisk(id);
      setRemovedRiskIds((prev) => [...prev, id]);
    } catch (err) {
      alert("Couldn't delete the risk — check the backend is running.");
    }
  }

  async function handleDeleteDep(id) {
    if (!confirm("Delete this dependency?")) return;
    try {
      await deleteDependency(id);
      setRemovedDepIds((prev) => [...prev, id]);
    } catch (err) {
      alert("Couldn't delete the dependency — check the backend is running.");
    }
  }

  async function handleDeleteUatSit(id) {
    if (!confirm("Delete this SIT/UAT record?")) return;
    try {
      await deleteUatSit(id);
      setRemovedUatSitIds((prev) => [...prev, id]);
    } catch (err) {
      alert("Couldn't delete the record — check the backend is running.");
    }
  }

  async function handleDeleteGolive() {
    if (!goliveRow?.id) return;
    if (!confirm("Delete Go-Live readiness for this project?")) return;
    try {
      await deleteGolive(goliveRow.id);
      setGoliveDeleted(true);
      setGoliveOverride(null);
    } catch (err) {
      alert("Couldn't delete Go-Live readiness — check the backend is running.");
    }
  }

  if (editing) {
    return (
      <div className="space-y-4 max-w-[1200px]">
        <button onClick={() => setEditing(false)} className="text-[12px] text-muted hover-text-primary flex items-center gap-1">← Back to project</button>
        <EditProjectForm project={p} users={users} onCancel={() => setEditing(false)} onSaved={(updated, leadName) => { onUpdated(updated, leadName); setEditing(false); }} />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-[12px] text-muted hover-text-primary flex items-center gap-1">← Back to portfolio</button>
        {canManage && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary">Edit</button>
            <button onClick={handleDelete} className="text-[12px] px-3 py-1.5 rounded border border-default text-red">Delete</button>
          </div>
        )}
      </div>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{p.name}</h1>
            <Pill color={healthColor(p.health)}>{p.health}</Pill>
          </div>
          <p className="text-[12.5px] text-muted mt-1">{p.id} · {p.domain} · {p.business} · Lead: {p.lead}</p>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted">Forecast finish</div>
          <div className="text-[14px] font-semibold">{fmtDate(p.forecastFinish)}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Progress" value={pct(p.progress)} />
        <KpiCard label="Delay" value={p.delayDays ?? "—"} unit={p.delayDays ? "d" : ""} />
        <KpiCard label="Open Risks" value={pRisks.filter(r => r.status !== "Closed").length} />
        <KpiCard label="Critical Defects" value={uatsit.reduce((s, u) => s + u.criticalDefects, 0)} />
      </div>

      <Card title="Blocker & Next Action">
        <div className="grid grid-cols-2 gap-4 text-[12.5px]">
          <div><div className="text-[11px] text-muted uppercase tracking-wider mb-1">Current blocker</div><div className="text-red">{p.blocker || "—"}</div></div>
          <div><div className="text-[11px] text-muted uppercase tracking-wider mb-1">Next action</div><div>{p.nextAction}</div></div>
        </div>
        {p.remarks && <div className="mt-3 pt-3 border-t border-default text-[12px] text-tertiary">{p.remarks}</div>}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card
          title="Milestones"
          right={canManage && (
            <button onClick={() => { setAddingMilestone((s) => !s); setEditingMilestoneId(null); }} className="text-[11px] font-medium text-accent">
              {addingMilestone ? "Cancel" : "+ Add"}
            </button>
          )}
        >
          {addingMilestone && (
            <MilestoneForm
              projectId={p.id}
              users={users}
              onCancel={() => setAddingMilestone(false)}
              onSaved={(saved, ownerName) => {
                setExtraMilestones((prev) => [
                  { id: saved.id, project: p.name, name: saved.title, owner: ownerName, ownerId: saved.owner_id, planned: saved.due_date, forecast: saved.forecast_date, status: saved.status },
                  ...prev,
                ]);
                setAddingMilestone(false);
              }}
            />
          )}
          {pMilestones.length === 0 && !addingMilestone ? <Empty /> : pMilestones.map((m) => (
            editingMilestoneId === m.id ? (
              <MilestoneForm
                key={m.id}
                projectId={p.id}
                users={users}
                initial={m}
                onCancel={() => setEditingMilestoneId(null)}
                onSaved={(saved, ownerName) => {
                  setMilestoneOverrides((prev) => ({
                    ...prev,
                    [m.id]: { name: saved.title, owner: ownerName, ownerId: saved.owner_id, planned: saved.due_date, forecast: saved.forecast_date, status: saved.status },
                  }));
                  setEditingMilestoneId(null);
                }}
              />
            ) : (
              <div key={m.id} className="group flex items-center justify-between gap-2">
                <RowLine
                  left={m.name}
                  right={<Pill color={m.status === "On Track" ? RAG_COLOR.Green : m.status === "Blocked" ? RAG_COLOR.Red : RAG_COLOR.Amber}>{m.status}</Pill>}
                  sub={`Owner: ${m.owner} · Planned ${fmtDate(m.planned)} → Forecast ${fmtDate(m.forecast)}`}
                />
                {canManage && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditingMilestoneId(m.id)} className="text-[11px] text-muted hover:underline">Edit</button>
                    <button onClick={() => handleDeleteMilestone(m.id)} className="text-[11px] text-red hover:underline">Delete</button>
                  </div>
                )}
              </div>
            )
          ))}
        </Card>

        <Card
          title="Tasks"
          right={canManage && (
            <button onClick={() => { setAddingTask((s) => !s); setEditingTaskId(null); }} className="text-[11px] font-medium text-accent">
              {addingTask ? "Cancel" : "+ Add"}
            </button>
          )}
        >
          {addingTask && (
            <TaskForm
              projectId={p.id}
              users={users}
              onCancel={() => setAddingTask(false)}
              onSaved={(saved, ownerName) => {
                setExtraTasks((prev) => [
                  { id: saved.id, project: p.name, task: saved.title, owner: ownerName, assigneeId: saved.assignee_id, status: saved.status, priority: saved.priority, finish: saved.due_date, progress: 0 },
                  ...prev,
                ]);
                setAddingTask(false);
              }}
            />
          )}
          {pTasks.length === 0 && !addingTask ? <Empty /> : pTasks.map((t) => (
            editingTaskId === t.id ? (
              <TaskForm
                key={t.id}
                projectId={p.id}
                users={users}
                initial={t}
                onCancel={() => setEditingTaskId(null)}
                onSaved={(saved, ownerName) => {
                  setTaskOverrides((prev) => ({
                    ...prev,
                    [t.id]: { task: saved.title, owner: ownerName, assigneeId: saved.assignee_id, status: saved.status, priority: saved.priority, finish: saved.due_date, progress: saved.progress !== null ? Number(saved.progress) : 0 },
                  }));
                  setEditingTaskId(null);
                }}
              />
            ) : (
              <div key={t.id} className="group flex items-center justify-between gap-2">
                <RowLine left={t.task} right={<span className="text-[11px] text-tertiary">{pct(t.progress)}</span>} sub={`${t.owner} · ${t.status} · due ${fmtDate(t.finish)}`} />
                {canManage && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditingTaskId(t.id)} className="text-[11px] text-muted hover:underline">Edit</button>
                    <button onClick={() => handleDeleteTask(t.id)} className="text-[11px] text-red hover:underline">Delete</button>
                  </div>
                )}
              </div>
            )
          ))}
        </Card>

        <Card
          title="Risks"
          right={canManage && (
            <button onClick={() => { setAddingRisk((s) => !s); setEditingRiskId(null); }} className="text-[11px] font-medium text-accent">
              {addingRisk ? "Cancel" : "+ Add"}
            </button>
          )}
        >
          {addingRisk && (
            <RiskForm
              projectId={p.id}
              users={users}
              onCancel={() => setAddingRisk(false)}
              onSaved={(saved, ownerName) => {
                setExtraRisks((prev) => [
                  { id: saved.id, project: p.name, risk: saved.description, severity: saved.severity, probability: saved.probability, impact: saved.impact, score: saved.score, mitigation: saved.mitigation, owner: ownerName, ownerId: saved.owner_id, status: saved.status },
                  ...prev,
                ]);
                setAddingRisk(false);
              }}
            />
          )}
          {pRisks.length === 0 && !addingRisk ? <Empty /> : pRisks.map((r) => (
            editingRiskId === r.id ? (
              <RiskForm
                key={r.id}
                projectId={p.id}
                users={users}
                initial={r}
                onCancel={() => setEditingRiskId(null)}
                onSaved={(saved, ownerName) => {
                  setRiskOverrides((prev) => ({
                    ...prev,
                    [r.id]: { risk: saved.description, severity: saved.severity, probability: saved.probability, impact: saved.impact, score: saved.score, mitigation: saved.mitigation, owner: ownerName, ownerId: saved.owner_id, status: saved.status },
                  }));
                  setEditingRiskId(null);
                }}
              />
            ) : (
              <div key={r.id} className="group flex items-center justify-between gap-2">
                <RowLine left={r.risk} right={<Pill color={r.score >= 9 ? RAG_COLOR.Red : r.score >= 6 ? RAG_COLOR.Amber : RAG_COLOR.Green}>{r.score ?? "—"}</Pill>} sub={`Owner: ${r.owner} · ${r.mitigation || "No mitigation logged"}`} />
                {canManage && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditingRiskId(r.id)} className="text-[11px] text-muted hover:underline">Edit</button>
                    <button onClick={() => handleDeleteRisk(r.id)} className="text-[11px] text-red hover:underline">Delete</button>
                  </div>
                )}
              </div>
            )
          ))}
        </Card>

        <Card
          title="Dependencies"
          right={canManage && (
            <button onClick={() => { setAddingDep((s) => !s); setEditingDepId(null); }} className="text-[11px] font-medium text-accent">
              {addingDep ? "Cancel" : "+ Add"}
            </button>
          )}
        >
          {addingDep && (
            <DependencyForm
              projectId={p.id}
              users={users}
              onCancel={() => setAddingDep(false)}
              onSaved={(saved, ownerName) => {
                setExtraDeps((prev) => [
                  { id: saved.id, project: p.name, dependsOn: saved.depends_on, critical: saved.critical === "Yes", ownerId: saved.owner_id, owner: ownerName, status: saved.status, target: saved.target_date },
                  ...prev,
                ]);
                setAddingDep(false);
              }}
            />
          )}
          {deps.length === 0 && !addingDep ? <Empty /> : deps.map((d) => (
            editingDepId === d.id ? (
              <DependencyForm
                key={d.id}
                projectId={p.id}
                users={users}
                initial={d}
                onCancel={() => setEditingDepId(null)}
                onSaved={(saved, ownerName) => {
                  setDepOverrides((prev) => ({
                    ...prev,
                    [d.id]: { dependsOn: saved.depends_on, critical: saved.critical === "Yes", ownerId: saved.owner_id, owner: ownerName, status: saved.status, target: saved.target_date },
                  }));
                  setEditingDepId(null);
                }}
              />
            ) : (
              <div key={d.id} className="group flex items-center justify-between gap-2">
                <RowLine left={d.dependsOn} right={d.critical ? <Pill color={RAG_COLOR.Red}>Critical</Pill> : <Pill color={RAG_COLOR.Amber}>{d.status}</Pill>} sub={`Owner: ${d.owner} · Target ${fmtDate(d.target)}`} />
                {canManage && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditingDepId(d.id)} className="text-[11px] text-muted hover:underline">Edit</button>
                    <button onClick={() => handleDeleteDep(d.id)} className="text-[11px] text-red hover:underline">Delete</button>
                  </div>
                )}
              </div>
            )
          ))}
        </Card>

        <Card
          title="SIT / UAT"
          right={canManage && (
            <button onClick={() => { setAddingUatSit((s) => !s); setEditingUatSitId(null); }} className="text-[11px] font-medium text-accent">
              {addingUatSit ? "Cancel" : "+ Add"}
            </button>
          )}
        >
          {addingUatSit && (
            <UatSitForm
              projectId={p.id}
              onCancel={() => setAddingUatSit(false)}
              onSaved={(saved) => {
                setExtraUatSit((prev) => [
                  { id: saved.id, project: p.name, module: saved.module, sit: Number(saved.sit_pct), uat: Number(saved.uat_pct), openDefects: saved.open_defects, criticalDefects: saved.critical_defects, ready: saved.ready === "Yes" },
                  ...prev,
                ]);
                setAddingUatSit(false);
              }}
            />
          )}
          {uatsit.length === 0 && !addingUatSit ? <Empty /> : uatsit.map((u) => (
            editingUatSitId === u.id ? (
              <UatSitForm
                key={u.id}
                projectId={p.id}
                initial={u}
                onCancel={() => setEditingUatSitId(null)}
                onSaved={(saved) => {
                  setUatSitOverrides((prev) => ({
                    ...prev,
                    [u.id]: { module: saved.module, sit: Number(saved.sit_pct), uat: Number(saved.uat_pct), openDefects: saved.open_defects, criticalDefects: saved.critical_defects, ready: saved.ready === "Yes" },
                  }));
                  setEditingUatSitId(null);
                }}
              />
            ) : (
              <div key={u.id} className="group p-2.5 rounded bg-sidebar border border-default mb-2 last:mb-0">
                <div className="flex items-center justify-between">
                  <div className="text-[12.5px] font-medium mb-1.5">{u.module}</div>
                  {canManage && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditingUatSitId(u.id)} className="text-[11px] text-muted hover:underline">Edit</button>
                      <button onClick={() => handleDeleteUatSit(u.id)} className="text-[11px] text-red hover:underline">Delete</button>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 text-[11px] text-tertiary"><span>SIT {pct(u.sit)}</span><span>UAT {pct(u.uat)}</span><span className="text-red">{u.criticalDefects} critical defects</span></div>
              </div>
            )
          ))}
        </Card>

        <Card
          title="Go-Live Readiness"
          right={canManage && !editingGolive && (
            <button onClick={() => setEditingGolive(true)} className="text-[11px] font-medium text-accent">
              {goliveRow ? "Edit" : "+ Set Up"}
            </button>
          )}
        >
          {editingGolive ? (
            <GoliveForm
              projectId={p.id}
              initial={goliveRow}
              onCancel={() => setEditingGolive(false)}
              onSaved={(saved) => {
                setGoliveOverride({
                  id: saved.id, project: p.name, rfc: saved.rfc ?? "—", mop: saved.mop ?? "—",
                  rollback: saved.rollback ?? "—", monitoring: saved.monitoring ?? "—",
                  businessSignoff: saved.business_signoff ?? "—", techSignoff: saved.technical_signoff ?? "—",
                  ready: saved.ready === "Yes",
                });
                setGoliveDeleted(false);
                setEditingGolive(false);
              }}
            />
          ) : !goliveRow ? <Empty /> : (
            <div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                {["rfc", "mop", "rollback", "monitoring", "businessSignoff", "techSignoff"].map((k) => (
                  <div key={k} className="flex justify-between p-2 rounded bg-sidebar border border-default"><span className="text-tertiary capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span>{goliveRow[k]}</span></div>
                ))}
              </div>
              {canManage && (
                <div className="flex justify-end mt-2">
                  <button onClick={handleDeleteGolive} className="text-[11px] text-red hover:underline">Delete</button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {vendorActions.length > 0 && (
        <Card title="Vendor Actions">
          {vendorActions.map((v, i) => (
            <RowLine key={i} left={`${v.vendor} — ${v.action}`} right={<Pill color={v.status === "Overdue" ? RAG_COLOR.Red : RAG_COLOR.Amber}>{v.status}</Pill>} sub={`Owner: ${v.owner} · Due ${fmtDate(v.due)}`} />
          ))}
        </Card>
      )}
    </div>
  );
}

export default function Projects({
  projects,
  tasks,
  milestones,
  risks,
  dependencies,
  uatSit,
  golive,
  vendors,
  users,
  role,
  currentUser,
  selected,
  setSelected
}) {
  const [track, setTrack] = useState("it");
  const [filterHealth, setFilterHealth] = useState("All");
  const [mineOnly, setMineOnly] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [extraProjects, setExtraProjects] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [overrides, setOverrides] = useState({});

  const canManage = role === "manager" || role === "admin";

  const allProjects = [...projects, ...extraProjects]
    .filter((p) => !removedIds.includes(p.id))
    .map((p) => (overrides[p.id] ? { ...p, ...overrides[p.id] } : p));

  const trackList = allProjects.filter(
    (p) => (p.track ?? (p.projectType || "IT").toLowerCase()) === track
  );

  const healthFiltered = trackList.filter(
    (p) => filterHealth === "All" || p.health === filterHealth
  );

  const list = mineOnly
    ? healthFiltered.filter((p) => p.lead === currentUser)
    : healthFiltered;

  const detail = allProjects.find((p) => p.name === selected);

  const itCount = allProjects.filter(
    (p) => (p.track ?? (p.projectType || "IT").toLowerCase()) === "it"
  ).length;

  const businessCount = allProjects.filter(
    (p) => (p.track ?? (p.projectType || "IT").toLowerCase()) === "business"
  ).length;
  if (detail) {
    return (
      <ProjectDetail
        project={detail} tasks={tasks} milestones={milestones} risks={risks}
        dependencies={dependencies} uatSit={uatSit} golive={golive} vendors={vendors}
        users={users} canManage={canManage}
        onBack={() => setSelected(null)}
        onUpdated={(updated, leadName) => {
          setOverrides((prev) => ({
            ...prev,
            [updated.id]: {
              status: updated.status, health: updated.health,
              progress: updated.progress !== null ? Number(updated.progress) : null,
              delayDays: updated.delay_days !== null ? Number(updated.delay_days) : 0,
              blocker: updated.blocker, nextAction: updated.next_action,
              lead: leadName, leadId: updated.lead_id,
              plannedStart: updated.planned_start,
              plannedFinish: updated.planned_go_live,
              forecastFinish: updated.forecast_go_live,
            },
          }));
        }}
        onDeleted={(id) => setRemovedIds((prev) => [...prev, id])}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Project Portfolio</h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <MineToggle
              active={mineOnly}
              onToggle={() => setMineOnly((v) => !v)}
              label="My Projects"
            />

            {["All", "Red", "Amber", "Green", "Unknown"].map((h) => (
              <button
                key={h}
                onClick={() => setFilterHealth(h)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                  filterHealth === h
                    ? "bg-active border-accent text-primary"
                    : "border-default text-tertiary"
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          {canManage && (
            <button
              onClick={() => setShowForm((s) => !s)}
              className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium"
            >
              {showForm ? "Close" : "+ New Project"}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <NewProjectForm
          users={users}
          onCancel={() => setShowForm(false)}
          onSaved={(project, leadName) => {
            setExtraProjects((prev) => [
              {
                id: project.id,
                name: project.name,
                track: (project.project_type || "IT").toLowerCase(),
                domain: project.domain || "—",
                business: project.business || "—",
                lead: leadName,
                leadId: project.lead_id,
                priority: project.priority,
                status: project.status,
                phase: project.phase || "—",
                progress: 0,
                health: "Green",
                delayDays: 0,
                escalation: "No",
                blocker: "",
                nextAction: "—",
                remarks: "",
                plannedStart: project.planned_start,
                plannedFinish: project.planned_go_live,
                forecastFinish: project.forecast_go_live,
              },
              ...prev,
            ]);

            setShowForm(false);
          }}
        />
      )}

      <div className="flex gap-2 border-b border-default">
        <button onClick={() => setTrack("it")} className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px ${track === "it" ? "border-accent text-primary" : "border-transparent text-tertiary hover-text-primary"}`}>
          IT Projects <span className="text-[11px] text-muted font-normal">({itCount})</span>
        </button>
        <button onClick={() => setTrack("business")} className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px ${track === "business" ? "border-accent text-primary" : "border-transparent text-tertiary hover-text-primary"}`}>
          Business Projects <span className="text-[11px] text-muted font-normal">({businessCount})</span>
        </button>
      </div>
      <div className="bg-panel border border-default rounded-md overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-default text-muted text-[11px] uppercase tracking-wider">
              <th className="text-left px-4 py-2.5 font-medium">Project</th>
              <th className="text-left px-3 py-2.5 font-medium">Lead</th>
              <th className="text-left px-3 py-2.5 font-medium">Phase</th>
              <th className="text-left px-3 py-2.5 font-medium">Progress</th>
              <th className="text-left px-3 py-2.5 font-medium">Delay</th>
              <th className="text-left px-3 py-2.5 font-medium">Health</th>
              <th className="text-left px-3 py-2.5 font-medium">Escalation</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} onClick={() => setSelected(p.name)} className="border-b border-default last:border-0 hover:bg-input cursor-pointer">
                <td className="px-4 py-2.5"><div className="font-medium">{p.name}</div><div className="text-[11px] text-muted">{p.domain}</div></td>
                <td className="px-3 py-2.5 text-secondary">{p.lead}</td>
                <td className="px-3 py-2.5 text-secondary">{p.phase}</td>
                <td className="px-3 py-2.5 w-[120px]">
                  {p.progress !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-active rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: pct(p.progress), background: healthColor(p.health) }} /></div>
                      <span className="text-[11px] text-tertiary">{pct(p.progress)}</span>
                    </div>
                  ) : <span className="text-dim">—</span>}
                </td>
                <td className="px-3 py-2.5">{p.delayDays ? <span className="text-red font-medium">{p.delayDays}d</span> : <span className="text-green">on time</span>}</td>
                <td className="px-3 py-2.5"><Pill color={healthColor(p.health)}>{p.health}</Pill></td>
                <td className="px-3 py-2.5 text-[11px] text-secondary max-w-[160px] truncate">{p.escalation}</td>
              </tr>
            ))}
            {list.length === 0 && (<tr><td colSpan={7} className="px-4 py-6 text-center text-muted text-[12px]">No projects in this track yet.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
