import { Card, Pill } from "../components/ui";
import { fmtDate } from "../utils";
import { RAG_COLOR } from "../theme";

export default function Vendors({ role, vendors }) {
  const overdue = vendors.filter((v) => v.status === "Overdue");
  const open = vendors.filter((v) => v.status === "Open");

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Vendor Management</h1>
        <Pill color={overdue.length > 0 ? RAG_COLOR.Red : RAG_COLOR.Green}>
          {overdue.length} overdue
        </Pill>
      </div>

      <Card title="Vendor Action Tracker" subtitle="Pending actions and SLA status">
        {vendors.length === 0 && <div className="text-[12px] text-muted">No vendor actions recorded yet.</div>}
        
        <div className="space-y-2">
          {vendors.map((v, i) => (
            <div key={i} className="flex items-start justify-between gap-3 p-3 rounded bg-sidebar border border-default">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-medium">{v.vendor}</span>
                  <Pill color={v.status === "Overdue" ? RAG_COLOR.Red : v.status === "Open" ? RAG_COLOR.Amber : RAG_COLOR.Green}>
                    {v.status}
                  </Pill>
                </div>
                <div className="text-[11px] text-muted mt-1">{v.project}</div>
                <div className="text-[12px] text-secondary mt-1">{v.action}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] text-muted">Owner</div>
                <div className="text-[12px] font-medium">{v.owner}</div>
                <div className="text-[11px] text-muted mt-1">Due {fmtDate(v.due)}</div>
                {v.daysOpen > 0 && (
                  <div className="text-[11px] text-red font-medium">{v.daysOpen} days open</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {role !== "engineer" && (
        <div className="grid grid-cols-2 gap-4">
          <Card title="Overdue Actions">
            <div className="text-[12px] space-y-2">
              {overdue.length === 0 && <div className="text-muted">No overdue actions. Great!</div>}
              {overdue.map((v, i) => (
                <div key={i} className="p-2 rounded bg-input border border-default">
                  <div className="font-medium">{v.vendor} — {v.project}</div>
                  <div className="text-muted">{v.action}</div>
                  <div className="text-red text-[11px] mt-1">{v.daysOpen} days overdue</div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Open Actions">
            <div className="text-[12px] space-y-2">
              {open.length === 0 && <div className="text-muted">No open actions.</div>}
              {open.map((v, i) => (
                <div key={i} className="p-2 rounded bg-input border border-default">
                  <div className="font-medium">{v.vendor} — {v.project}</div>
                  <div className="text-muted">{v.action}</div>
                  <div className="text-amber text-[11px] mt-1">Due {fmtDate(v.due)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}