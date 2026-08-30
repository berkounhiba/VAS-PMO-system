import { useState } from "react";
import { Send, Lock, X } from "lucide-react";
import { Card, Pill, MineToggle } from "../components/ui";
import { fmtDate } from "../utils";
import { RAG_COLOR } from "../theme";
import { hasPerm } from "../roles";

export default function Vendors({ role, vendors, currentUser }) {
  const [draftFor, setDraftFor] = useState(null);
  const [mineOnly, setMineOnly] = useState(false);

  const canGenerate = hasPerm(role, "*") || hasPerm(role, "manage_projects");
  const shown = mineOnly ? vendors.filter((v) => v.owner === currentUser) : vendors;
  const overdue = shown.filter((v) => v.status === "Overdue");
  const open = shown.filter((v) => v.status === "Open");

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Vendor Management</h1>
        <div className="flex items-center gap-3">
          <MineToggle active={mineOnly} onToggle={() => setMineOnly((v) => !v)} label="My Actions" />
          <Pill color={overdue.length > 0 ? RAG_COLOR.Red : RAG_COLOR.Green}>
            {overdue.length} overdue
          </Pill>
        </div>
      </div>

      <Card title="Vendor Action Tracker" subtitle="Pending actions and SLA status">
        {shown.length === 0 && <div className="text-[12px] text-muted">No vendor actions to show.</div>}

        <div className="space-y-2">
          {shown.map((v, i) => (
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
              <div className="text-right shrink-0 flex flex-col items-end gap-2">
                <div>
                  <div className="text-[11px] text-muted">Owner</div>
                  <div className="text-[12px] font-medium">{v.owner}</div>
                  <div className="text-[11px] text-muted mt-1">Due {fmtDate(v.due)}</div>
                  {v.daysOpen > 0 && (
                    <div className="text-[11px] text-red font-medium">{v.daysOpen} days open</div>
                  )}
                </div>
                {canGenerate && (
                  <button
                    onClick={() => setDraftFor(v)}
                    className="text-[11px] font-medium bg-input border border-default px-2.5 py-1.5 rounded flex items-center gap-1"
                  >
                    <Send size={11} /> Draft follow-up
                  </button>
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

      {draftFor && <VendorDraftModal v={draftFor} onClose={() => setDraftFor(null)} />}
    </div>
  );
}

function VendorDraftModal({ v, onClose }) {
  const draft = `Subject: Follow-up — ${v.action} (${v.project})\n\nHi ${v.vendor} team,\n\nThis is a follow-up on the pending action "${v.action}" for ${v.project}, originally due ${fmtDate(v.due)}. This item has now been open for ${v.daysOpen} days and is affecting the project's delivery timeline.\n\nCould you please provide an updated status or completion date by end of day tomorrow?\n\nThanks,\n${v.owner}\nOoredoo VAS Team`;
  return (
    <div className="fixed inset-0 overlay-dim flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-[520px] bg-panel border border-default rounded-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[14px]">Vendor Follow-up — Draft</h3>
          <button onClick={onClose}><X size={16} className="text-muted" /></button>
        </div>
        <div className="bg-input border border-default rounded p-3 text-[12px] text-secondary whitespace-pre-wrap font-mono">{draft}</div>
        <div className="flex items-center gap-2 mt-3 text-[11px] text-muted">
          <Lock size={12} /> Requires human review, edit and explicit approval before sending. No message is sent automatically.
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5 rounded border border-default text-muted">Discard</button>
          <button className="text-[12px] px-3 py-1.5 rounded" style={{ background: "var(--bg-accent)", color: "var(--text-onaccent)" }}>
            Edit & Approve (not wired)
          </button>
        </div>
      </div>
    </div>
  );
}