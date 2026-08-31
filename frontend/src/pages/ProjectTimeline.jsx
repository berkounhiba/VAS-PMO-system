import { Card } from "../components/ui";
import { fmtDate } from "../utils";
import { RAG_COLOR } from "../theme";

export default function ProjectTimeline({ projects }) {
  const sorted = [...projects].sort((a, b) => {
    const da = a.plannedStart ? new Date(a.plannedStart) : new Date(a.plannedFinish || 0);
    const db = b.plannedStart ? new Date(b.plannedStart) : new Date(b.plannedFinish || 0);
    return da - db;
  });

  const dates = sorted
    .flatMap(p => [p.plannedStart, p.plannedFinish, p.forecastFinish].filter(Boolean))
    .map(d => new Date(d).getTime());

  const minDate = dates.length ? Math.min(...dates) : Date.now();
  const maxDate = dates.length ? Math.max(...dates) : Date.now();
  const totalSpan = maxDate - minDate || 1;

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Project Timeline</h1>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded border border-default text-[11px] font-medium text-tertiary hover:bg-input no-print"
        >
          🖨️ Export PDF
        </button>
      </div>
      <Card title="Portfolio Roadmap" subtitle="Planned vs Forecast delivery dates">
        <div className="space-y-3">
          {sorted.map((p) => {
            const start = new Date(p.plannedStart || p.plannedFinish || Date.now()).getTime();
            const end = new Date(p.forecastFinish || p.plannedFinish || Date.now()).getTime();
            const left = ((start - minDate) / totalSpan) * 100;
            const width = ((end - start) / totalSpan) * 100;
            const color = p.health === "Green" ? RAG_COLOR.Green : p.health === "Amber" ? RAG_COLOR.Amber : RAG_COLOR.Red;

            return (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-[180px] shrink-0 text-[12px] font-medium truncate">{p.name}</div>
                <div className="flex-1 h-6 bg-active rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 h-full rounded-full opacity-80"
                    style={{ left: `${Math.max(0, left)}%`, width: `${Math.max(2, width)}%`, background: color }}
                    title={`${fmtDate(p.plannedStart)} → ${fmtDate(p.forecastFinish)}`}
                  />
                </div>
                <div className="w-[80px] text-right text-[11px] text-muted shrink-0">{p.delayDays ? `${p.delayDays}d late` : "On time"}</div>
              </div>
            );
          })}
          {sorted.length === 0 && <div className="text-[12px] text-muted">No projects with dates available.</div>}
        </div>
        <div className="flex gap-4 mt-4 text-[11px] text-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: RAG_COLOR.Green }} /> On Track</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: RAG_COLOR.Amber }} /> At Risk</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: RAG_COLOR.Red }} /> Delayed</span>
        </div>
      </Card>
    </div>
  );
}