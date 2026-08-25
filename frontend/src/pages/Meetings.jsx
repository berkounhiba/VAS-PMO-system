import { Card } from "../components/ui";
import { fmtDate } from "../utils";

export default function Meetings({ meetings }) {
  return (
    <div className="space-y-5 max-w-[1000px]">
      <h1 className="text-xl font-bold">Meetings & Action Items</h1>
      <Card title="Recent & Upcoming">
        {meetings.length === 0 && <div className="text-[12px] text-muted">No meetings recorded yet.</div>}
        {meetings.map((m, i) => (
          <div key={i} className="p-3 rounded bg-sidebar border border-default mb-2 last:mb-0">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium">{m.topic}</span>
              <span className="text-[11px] text-muted">{fmtDate(m.date)}</span>
            </div>
            <div className="text-[11px] text-muted mt-0.5">{m.project}</div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-[11.5px]">
              <div><span className="text-muted">Decision: </span>{m.decision}</div>
              <div><span className="text-muted">Action ({m.owner}): </span>{m.action}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
