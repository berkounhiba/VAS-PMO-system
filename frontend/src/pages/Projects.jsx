import { useState } from "react";
import { Card, KpiCard, Pill, Empty, RowLine, healthColor } from "../components/ui";
import { fmtDate, pct } from "../utils";
import { RAG_COLOR } from "../theme";

function ProjectDetail({ project: p, tasks, milestones, risks, dependencies, uatSit, golive, vendors, onBack }) {
  const pMilestones = milestones.filter((m) => m.project === p.name);
  const pTasks = tasks.filter((t) => t.project === p.name);
  const pRisks = risks.filter((r) => r.project === p.name);
  const deps = dependencies.filter((d) => d.project === p.name);
  const uatsit = uatSit.filter((u) => u.project === p.name);
  const goliveRow = golive.find((g) => g.project === p.name);
  const vendorActions = vendors.filter((v) => v.project === p.name);

  return (
    <div className="space-y-5 max-w-[1200px]">
      <button onClick={onBack} className="text-[12px] text-muted hover-text-primary flex items-center gap-1">
        ← Back to portfolio
      </button>
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
          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider mb-1">Current blocker</div>
            <div className="text-red">{p.blocker || "—"}</div>
          </div>
          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider mb-1">Next action</div>
            <div>{p.nextAction}</div>
          </div>
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
              <div className="flex gap-4 text-[11px] text-tertiary">
                <span>SIT {pct(u.sit)}</span><span>UAT {pct(u.uat)}</span>
                <span className="text-red">{u.criticalDefects} critical defects</span>
              </div>
            </div>
          ))}
        </Card>
        <Card title="Go-Live Readiness">
          {!goliveRow ? <Empty /> : (
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {["rfc", "mop", "rollback", "monitoring", "businessSignoff", "techSignoff"].map((k) => (
                <div key={k} className="flex justify-between p-2 rounded bg-sidebar border border-default">
                  <span className="text-tertiary capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                  <span>{goliveRow[k]}</span>
                </div>
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

export default function Projects({ projects, tasks, milestones, risks, dependencies, uatSit, golive, vendors, selected, setSelected }) {
  const [filterHealth, setFilterHealth] = useState("All");
  const list = projects.filter((p) => filterHealth === "All" || p.health === filterHealth);
  const detail = projects.find((p) => p.name === selected);

  if (detail) {
    return (
      <ProjectDetail
        project={detail}
        tasks={tasks}
        milestones={milestones}
        risks={risks}
        dependencies={dependencies}
        uatSit={uatSit}
        golive={golive}
        vendors={vendors}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Project Portfolio</h1>
        <div className="flex items-center gap-1.5">
          {["All", "Red", "Amber", "Green", "Unknown"].map((h) => (
            <button key={h} onClick={() => setFilterHealth(h)} className={`px-2.5 py-1 rounded text-[11px] font-medium border ${filterHealth === h ? "bg-active border-accent text-primary" : "border-default text-tertiary"}`}>
              {h}
            </button>
          ))}
        </div>
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
                <td className="px-4 py-2.5">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[11px] text-muted">{p.domain}</div>
                </td>
                <td className="px-3 py-2.5 text-secondary">{p.lead}</td>
                <td className="px-3 py-2.5 text-secondary">{p.phase}</td>
                <td className="px-3 py-2.5 w-[120px]">
                  {p.progress !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-active rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: pct(p.progress), background: healthColor(p.health) }} />
                      </div>
                      <span className="text-[11px] text-tertiary">{pct(p.progress)}</span>
                    </div>
                  ) : <span className="text-dim">—</span>}
                </td>
                <td className="px-3 py-2.5">{p.delayDays ? <span className="text-red font-medium">{p.delayDays}d</span> : <span className="text-green">on time</span>}</td>
                <td className="px-3 py-2.5"><Pill color={healthColor(p.health)}>{p.health}</Pill></td>
                <td className="px-3 py-2.5 text-[11px] text-secondary max-w-[160px] truncate">{p.escalation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
