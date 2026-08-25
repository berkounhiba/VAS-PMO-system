import { Card, Pill, ProgressBar } from "../components/ui";
import { RAG_COLOR } from "../theme";

export default function DeliveryControl({ uatSit, golive }) {
  return (
    <div className="space-y-5 max-w-[1200px]">
      <h1 className="text-xl font-bold">Delivery Control — SIT / UAT / Go-Live</h1>
      <Card title="SIT & UAT Progress">
        <div className="space-y-2">
          {uatSit.length === 0 && <div className="text-[12px] text-muted">No SIT/UAT records yet.</div>}
          {uatSit.map((u, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_100px_80px_80px] items-center gap-3 p-2.5 rounded bg-sidebar border border-default">
              <div>
                <div className="text-[12.5px] font-medium">{u.project}</div>
                <div className="text-[11px] text-muted">{u.module}</div>
              </div>
              <ProgressBar label="SIT" value={u.sit} />
              <ProgressBar label="UAT" value={u.uat} />
              <span className="text-[11px] text-red text-center">{u.criticalDefects} crit.</span>
              <span className="text-[11px] text-tertiary text-center">{u.openDefects} open</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Go-Live Readiness Checklist">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-muted uppercase text-[10.5px] tracking-wider border-b border-default">
              <th className="text-left py-2">Project</th>
              <th className="text-left py-2">RFC</th>
              <th className="text-left py-2">MOP</th>
              <th className="text-left py-2">Rollback</th>
              <th className="text-left py-2">Monitoring</th>
              <th className="text-left py-2">Business</th>
              <th className="text-left py-2">Technical</th>
              <th className="text-left py-2">Ready</th>
            </tr>
          </thead>
          <tbody>
            {golive.map((g, i) => (
              <tr key={i} className="border-b border-default last:border-0">
                <td className="py-2.5 font-medium">{g.project}</td>
                <td className="py-2.5 text-secondary">{g.rfc}</td>
                <td className="py-2.5 text-secondary">{g.mop}</td>
                <td className="py-2.5 text-secondary">{g.rollback}</td>
                <td className="py-2.5 text-secondary">{g.monitoring}</td>
                <td className="py-2.5 text-secondary">{g.businessSignoff}</td>
                <td className="py-2.5 text-secondary">{g.techSignoff}</td>
                <td className="py-2.5"><Pill color={g.ready ? RAG_COLOR.Green : RAG_COLOR.Red}>{g.ready ? "Yes" : "No"}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
        {golive.length === 0 && <div className="text-[12px] text-muted mt-2">No go-live records yet.</div>}
      </Card>
    </div>
  );
}
