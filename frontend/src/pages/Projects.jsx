import { useState } from "react";
import { Card, KpiCard, Pill, Empty, RowLine, healthColor, MineToggle } from "../components/ui";
import { fmtDate, pct } from "../utils";
import { RAG_COLOR } from "../theme";
import { createProject, updateProject, deleteProject } from "../api";

function NewProjectForm({ users, onSaved, onCancel }) {
  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState("IT");
  const [domain, setDomain] = useState("");
  const [priority, setPriority] = useState("");
  const [leadId, setLeadId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const project = await createProject({ name, projectType, domain, priority: priority || "Medium", leadId: leadId || null });
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
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium">
          {saving ? "Saving…" : "Create Project"}
        </button>
      </div>
    </div>
  );
}

function EditProjectForm({ project, users, onSaved, onCancel }) {
  const [status, setStatus] = useState(project.status || "On Track");
  const [health, setHealth] = useState(project.health || "Green");
  const [progress, setProgress] = useState(project.progress ?? 0);
  const [blocker, setBlocker] = useState(project.blocker || "");
  const [nextAction, setNextAction] = useState(project.nextAction || "");
  const [leadId, setLeadId] = useState(project.leadId || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateProject(project.id, {
        status, health, progress: Number(progress),
        blocker, next_action: nextAction, lead_id: leadId || null, priority,
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
          <select value={health} onChange={(e) => setHealth(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option>Green</option><option>Amber</option><option>Red</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px]">
            <option value="" disabled>Select priority…</option>
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
          <input type="number" min="0" max="1" step="0.05" value={progress} onChange={(e) => setProgress(e.target.value)} placeholder="Progress (0-1)" className="w-28 bg-input border border-default rounded px-3 py-2 text-[12.5px]" />
        </div>
        <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px]">
          <option value="">Assign to…</option>
          {users.map((u) => (<option key={u.id} value={u.id}>{u.name} — {u.role}</option>))}
        </select>
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

function ProjectDetail({ project: p, tasks, milestones, risks, dependencies, uatSit, golive, vendors, users, canManage, onBack, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const pMilestones = milestones.filter((m) => m.project === p.name);
  const pTasks = tasks.filter((t) => t.project === p.name);
  const pRisks = risks.filter((r) => r.project === p.name);
  const deps = dependencies.filter((d) => d.project === p.name);
  const uatsit = uatSit.filter((u) => u.project === p.name);
  const goliveRow = golive.find((g) => g.project === p.name);
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
        <Card title="Milestones">
          {pMilestones.length === 0 ? <Empty /> : pMilestones.map((m, i) => (
            <RowLine key={i} left={m.name} right={<Pill color={m.status === "On Track" ? RAG_COLOR.Green : m.status === "Blocked" ? RAG_COLOR.Red : RAG_COLOR.Amber}>{m.status}</Pill>} sub={`Owner: ${m.owner} · Planned ${fmtDate(m.planned)} → Forecast ${fmtDate(m.forecast)}`} />
          ))}
        </Card>
        <Card title="Tasks">
          {pTasks.length === 0 ? <Empty /> : pTasks.map((t, i) => (
            <RowLine key={i} left={t.task} right={<span className="text-[11px] text-tertiary">{pct(t.progress)}</span>} sub={`${t.owner} · ${t.status} · due ${fmtDate(t.finish)}`} />
          ))}
        </Card>
        <Card title="Risks">
          {pRisks.length === 0 ? <Empty /> : pRisks.map((r, i) => (
            <RowLine key={i} left={r.risk} right={<Pill color={r.score >= 9 ? RAG_COLOR.Red : r.score >= 6 ? RAG_COLOR.Amber : RAG_COLOR.Green}>{r.score}</Pill>} sub={`Owner: ${r.owner} · ${r.mitigation}`} />
          ))}
        </Card>
        <Card title="Dependencies">
          {deps.length === 0 ? <Empty /> : deps.map((d, i) => (
            <RowLine key={i} left={d.dependsOn} right={d.critical ? <Pill color={RAG_COLOR.Red}>Critical</Pill> : <Pill color={RAG_COLOR.Amber}>{d.status}</Pill>} sub={`Owner: ${d.owner} · Target ${fmtDate(d.target)}`} />
          ))}
        </Card>
        <Card title="SIT / UAT">
          {uatsit.length === 0 ? <Empty /> : uatsit.map((u, i) => (
            <div key={i} className="p-2.5 rounded bg-sidebar border border-default mb-2 last:mb-0">
              <div className="text-[12.5px] font-medium mb-1.5">{u.module}</div>
              <div className="flex gap-4 text-[11px] text-tertiary"><span>SIT {pct(u.sit)}</span><span>UAT {pct(u.uat)}</span><span className="text-red">{u.criticalDefects} critical defects</span></div>
            </div>
          ))}
        </Card>
        <Card title="Go-Live Readiness">
          {!goliveRow ? <Empty /> : (
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {["rfc", "mop", "rollback", "monitoring", "businessSignoff", "techSignoff"].map((k) => (
                <div key={k} className="flex justify-between p-2 rounded bg-sidebar border border-default"><span className="text-tertiary capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span>{goliveRow[k]}</span></div>
              ))}
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
              blocker: updated.blocker, nextAction: updated.next_action,
              lead: leadName, leadId: updated.lead_id,
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