import { useState } from "react";
import { Card, Pill } from "../components/ui";
import { fmtDate } from "../utils";
import { RAG_COLOR } from "../theme";
import { draftVendorEmail } from "../api";
import { Mail, X, Copy, Check } from "lucide-react";

export default function Vendors({ role, vendors }) {
  const overdue = vendors.filter((v) => v.status === "Overdue");
  const open = vendors.filter((v) => v.status === "Open");

  const [draft, setDraft] = useState(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDraft(v) {
    setDraftLoading(true);
    setCopied(false);
    try {
      const data = await draftVendorEmail(v.vendor, v.action, v.daysOpen, v.owner, v.project);
      setDraft({ email: data.email, vendor: v.vendor, action: v.action });
    } catch (e) {
      setDraft({ email: "Failed to draft email. Try again.", vendor: v.vendor, action: v.action });
    } finally {
      setDraftLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(draft.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12.5px] font-medium">{v.vendor}</span>
                  <Pill color={v.status === "Overdue" ? RAG_COLOR.Red : v.status === "Open" ? RAG_COLOR.Amber : RAG_COLOR.Green}>
                    {v.status}
                  </Pill>
                  {v.status === "Overdue" && (
                    <button
                      onClick={() => handleDraft(v)}
                      disabled={draftLoading}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-accent text-white hover:opacity-90 disabled:opacity-50"
                    >
                      <Mail size={12} />
                      {draftLoading && draft?.vendor === v.vendor ? "Drafting…" : "Draft Email"}
                    </button>
                  )}
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

      {/* Email Draft Modal */}
      {draft && (
        <div className="fixed inset-0 overlay-dim flex items-center justify-center z-50 p-4" onClick={() => setDraft(null)}>
          <div className="bg-panel border border-default rounded-xl w-full max-w-[600px] max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold">Draft Email — {draft.vendor}</h3>
              <button onClick={() => setDraft(null)} className="text-muted hover:text-primary"><X size={16} /></button>
            </div>
            <div className="text-[11px] text-muted mb-3">Action: {draft.action}</div>
            <div className="bg-sidebar border border-default rounded-md p-4 text-[12.5px] whitespace-pre-wrap font-mono leading-relaxed text-secondary">
              {draft.email}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-2 rounded bg-active text-primary text-[12px] font-medium hover:bg-input"
              >
                {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}