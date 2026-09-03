import { useState } from "react";
import { Card } from "../components/ui";
import { generateWeeklyReport } from "../api";
import { FileText, Copy, Check, RefreshCw } from "lucide-react";

export default function WeeklyReport({ projects, risks, vendors, kpiHistory, meetings }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setCopied(false);
    try {
      const context = {
        projects: projects.map((p) => ({
          name: p.name, status: p.status, health: p.health,
          delayDays: p.delayDays, blocker: p.blocker,
        })),
        risks: risks.filter((r) => r.status === "Open").map((r) => ({
          project: r.project, risk: r.risk, score: r.score,
        })),
        vendors: vendors.map((v) => ({
          vendor: v.vendor, project: v.project, action: v.action,
          status: v.status, daysOpen: v.daysOpen,
        })),
        kpiHistory: kpiHistory.slice(-3),
        meetings: meetings.slice(-3).map((m) => ({
          topic: m.topic, decision: m.decision, action: m.action,
        })),
      };
      const data = await generateWeeklyReport(context);
      setReport(data.report);
    } catch (e) {
      setReport("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  }

  function copyReport() {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText size={20} /> Weekly Director Report
          </h1>
          <p className="text-[13px] text-muted mt-1">One-click executive summary for leadership</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded bg-accent text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
          {loading ? "Generating…" : "Generate Report"}
        </button>
      </div>

      {!report && (
        <Card className="text-center py-12">
          <FileText size={32} className="text-muted mx-auto mb-3" />
          <div className="text-[13px] text-secondary font-medium">No report generated yet</div>
          <div className="text-[11px] text-muted mt-1">Click "Generate Report" to produce this week's director summary</div>
        </Card>
      )}

      {report && (
        <Card
          title="Generated Report"
          right={
            <button onClick={copyReport} className="flex items-center gap-1.5 text-[11px] text-accent hover:underline">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          }
        >
          <div className="text-[13px] leading-relaxed whitespace-pre-wrap text-secondary">
            {report}
          </div>
        </Card>
      )}
    </div>
  );
}