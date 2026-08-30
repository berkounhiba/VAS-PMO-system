import { Sparkles } from "lucide-react";
import { Card, KpiCard, Pill } from "../components/ui";
import { fmtDate, daysUntil } from "../utils";
import { RAG_COLOR } from "../theme";
import { ROLES } from "../roles";

export default function MyDay({ role, currentUser, tasks, milestones, risks, vendors, meetings, onOpenProject }) {
  const myTasks = tasks.filter((t) => t.owner === currentUser);
  const overdue = myTasks.filter((t) => daysUntil(t.finish) < 0 && t.status !== "Done");
  const dueSoon = myTasks.filter((t) => daysUntil(t.finish) >= 0 && daysUntil(t.finish) <= 5);
  const myMeetings = meetings.filter((m) => m.owner === currentUser);
  const myVendorActions = vendors.filter((v) => v.owner === currentUser);
  const myRisks = risks.filter((r) => r.owner === currentUser);

  const isPersonal = role === "engineer";

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h1 className="text-xl font-bold">Good to see you, {currentUser}</h1>
        <p className="text-[13px] text-muted mt-1">Prioritized by deadline, dependency and project health, not just due date</p>
      </div>

      {!isPersonal && (
        <div className="bg-input border border-default rounded-md p-3 text-[12px] text-secondary flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          As {ROLES[role].label.toLowerCase()}, your day view mixes personal items with portfolio-wide attention items below.
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Overdue" value={overdue.length} />
        <KpiCard label="Due this week" value={dueSoon.length} />
        <KpiCard label="Meetings today/upcoming" value={myMeetings.length} />
        <KpiCard label="Risks owned" value={myRisks.length} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Urgent" subtitle="Overdue or blocked — needs action today">
          {overdue.length === 0 && myTasks.filter(t => t.status === "Blocked").length === 0 && (
            <div className="text-[12px] text-muted">Nothing overdue. Good position.</div>
          )}
          <div className="space-y-2">
            {[...overdue, ...myTasks.filter((t) => t.status === "Blocked" && !overdue.includes(t))].map((t, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-2.5 rounded bg-sidebar border border-default">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium truncate">{t.task}</div>
                  <button onClick={() => onOpenProject(t.project)} className="text-[11px] text-accent hover:underline">{t.project}</button>
                </div>
                <Pill color={t.status === "Blocked" ? RAG_COLOR.Red : RAG_COLOR.Amber}>{t.status === "Blocked" ? "Blocked" : `${Math.abs(daysUntil(t.finish))}d late`}</Pill>
              </div>
            ))}
          </div>
        </Card>

        <Card title="due soon" subtitle="Due within 5 days">
          {dueSoon.length === 0 && <div className="text-[12px] text-muted">Nothing due this week.</div>}
          <div className="space-y-2">
            {dueSoon.map((t, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-2.5 rounded bg-sidebar border border-default">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium truncate">{t.task}</div>
                  <button onClick={() => onOpenProject(t.project)} className="text-[11px] text-accent hover:underline">{t.project}</button>
                </div>
                <span className="text-[11px] text-muted shrink-0">Due {fmtDate(t.finish)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Meetings" subtitle="Where you are the owner of a decision or action">
          {myMeetings.length === 0 && <div className="text-[12px] text-muted">No meetings assigned to you.</div>}
          <div className="space-y-2">
            {myMeetings.map((m, i) => (
              <div key={i} className="p-2.5 rounded bg-sidebar border border-default">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-medium">{m.topic}</span>
                  <span className="text-[11px] text-muted">{fmtDate(m.date)}</span>
                </div>
                <div className="text-[11.5px] text-tertiary mt-1">Action: {m.action}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Vendor actions & risks you own">
          {myVendorActions.length === 0 && myRisks.length === 0 && <div className="text-[12px] text-muted">Nothing owned right now.</div>}
          <div className="space-y-2">
            {myVendorActions.map((v, i) => (
              <div key={"v" + i} className="flex items-center justify-between p-2.5 rounded bg-sidebar border border-default">
                <div className="text-[12.5px]">{v.vendor} — {v.action}</div>
                <Pill color={v.status === "Overdue" ? RAG_COLOR.Red : RAG_COLOR.Amber}>{v.status}</Pill>
              </div>
            ))}
            {myRisks.map((r, i) => (
              <div key={"r" + i} className="flex items-center justify-between p-2.5 rounded bg-sidebar border border-default">
                <div className="text-[12.5px]">{r.risk}</div>
                <Pill color={r.score >= 9 ? RAG_COLOR.Red : r.score >= 6 ? RAG_COLOR.Amber : RAG_COLOR.Green}>Score {r.score}</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
