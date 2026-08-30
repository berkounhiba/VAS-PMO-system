import { useState } from "react";
import { Send, Lock, X } from "lucide-react";
import { Card, Pill, MineToggle } from "../components/ui";
import { fmtDate } from "../utils";
import { RAG_COLOR } from "../theme";
import { hasPerm } from "../roles";

function VendorDraftModal({ v, onClose }) {
  const draft = `Subject: Follow-up — ${v.action} (${v.project})\n\nHi ${v.vendor} team,\n\nThis is a follow-up on the pending action "${v.action}" for ${v.project}, originally due ${v.due}. This item has now been open for ${v.daysOpen} days and is affecting the project's delivery timeline.\n\nCould you please provide an updated status or completion date by end of day tomorrow?\n\nThanks,\n${v.owner}\nOoredoo VAS Team`;
  return (
    <div className="fixed inset-0 overlay-dim flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-[520px] bg-sidebar border border-default rounded-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[14px]">Vendor Follow-up — Draft</h3>
          <button onClick={onClose}><X size={16} className="text-muted" /></button>
        </div>
        <div className="bg-input border border-default rounded p-3 text-[12px] text-bubble whitespace-pre-wrap font-mono">{draft}</div>
        <div className="flex items-center gap-2 mt-3 text-[11px] text-muted">
          <Lock size={12} /> Requires human review, edit and explicit approval before sending. No message is sent from this prototype.
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary">Discard</button>
          <button className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium">Edit & Approve (not wired)</button>
        </div>
      </div>
    </div>
  );
}

export default function Vendors({ role, vendors, currentUser }) {
  const [draftFor, setDraftFor] = useState(null);
  const [mineOnly, setMineOnly] = useState(false);
  const canGenerate = hasPerm(role, "*") || hasPerm(role, "manage_projects");
  const shown = mineOnly ? vendors.filter((v) => v.owner === currentUser) : vendors;

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Vendor Management</h1>
        <MineToggle active={mineOnly} onToggle={() => setMineOnly((v) => !v)} label="My Actions" />
      </div>
      <Card title="Open & Overdue Vendor Actions">
        <div className="space-y-2">
          {shown.length === 0 && <div className="text-[12px] text-muted">No vendor actions to show.</div>}
          {shown.map((v, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3 rounded bg-sidebar border border-default">
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium">{v.vendor} — {v.action}</div>
                <div className="text-[11px] text-muted mt-0.5">{v.project} · Owner {v.owner} · Due {fmtDate(v.due)} · {v.daysOpen} days open</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Pill color={v.status === "Overdue" ? RAG_COLOR.Red : RAG_COLOR.Amber}>{v.status}</Pill>
                {canGenerate && (
                  <button onClick={() => setDraftFor(v)} className="text-[11px] font-medium bg-active border border-default px-2.5 py-1.5 rounded hover:bg-active flex items-center gap-1">
                    <Send size={11} /> Draft follow-up
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      {draftFor && <VendorDraftModal v={draftFor} onClose={() => setDraftFor(null)} />}
    </div>
  );
}
