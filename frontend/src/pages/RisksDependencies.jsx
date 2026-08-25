import { ArrowUpRight } from "lucide-react";
import { Card, Pill } from "../components/ui";
import { fmtDate } from "../utils";
import { RAG_COLOR } from "../theme";

export default function RisksDependencies({ risks, dependencies }) {
  return (
    <div className="space-y-5 max-w-[1200px]">
      <h1 className="text-xl font-bold">Risks & Dependencies</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Risk Register" subtitle="Sorted by severity score">
          {risks.slice().sort((a, b) => b.score - a.score).map((r) => (
            <div key={r.id} className="p-3 rounded bg-sidebar border border-default mb-2 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12.5px] font-medium">{r.risk}</span>
                <Pill color={r.score >= 9 ? RAG_COLOR.Red : r.score >= 6 ? RAG_COLOR.Amber : RAG_COLOR.Green}>Score {r.score}</Pill>
              </div>
              <div className="text-[11px] text-muted mb-1.5">{r.project} · Prob {r.probability} · Impact {r.impact} · Owner {r.owner}</div>
              <div className="text-[11.5px] text-tertiary">Mitigation: {r.mitigation}</div>
            </div>
          ))}
          {risks.length === 0 && <div className="text-[12px] text-muted">No risks recorded yet.</div>}
        </Card>
        <Card title="Dependency Map" subtitle="Cross-project blockers">
          {dependencies.map((d, i) => (
            <div key={i} className="p-3 rounded bg-sidebar border border-default mb-2 last:mb-0">
              <div className="flex items-center gap-2 text-[12.5px] font-medium">
                {d.project} <ArrowUpRight size={12} className="text-muted" /> {d.dependsOn}
              </div>
              <div className="text-[11px] text-muted mt-1 flex items-center gap-2">
                {d.critical && <Pill color={RAG_COLOR.Red}>Critical path</Pill>}
                <span>{d.status} · Owner {d.owner} · Target {fmtDate(d.target)}</span>
              </div>
            </div>
          ))}
          {dependencies.length === 0 && <div className="text-[12px] text-muted">No dependencies recorded yet.</div>}
        </Card>
      </div>
    </div>
  );
}
