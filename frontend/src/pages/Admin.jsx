import { Card, Pill } from "../components/ui";
import { pct } from "../utils";
import { RAG_THRESHOLDS, UTIL_THRESHOLDS } from "../sampleData";
import { RAG_COLOR } from "../theme";
import { ROLES } from "../roles";

export default function Admin({ users, resources }) {
  return (
    <div className="space-y-5 max-w-[1000px]">
      <h1 className="text-xl font-bold">Administration</h1>
      <p className="text-[13px] text-muted">Visible only to Administrators.</p>

      <Card title="Users & Team Members" subtitle="Real accounts from the database — user management (add/edit/deactivate) lands with Sprint 3 login work">
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-2.5 rounded bg-sidebar border border-default">
              <div>
                <div className="text-[12.5px] font-medium">{u.name}</div>
                <div className="text-[11px] text-muted">{u.role}</div>
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="text-[12px] text-muted">No users loaded yet.</div>}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card title="RAG Thresholds (configurable)">
          <div className="space-y-2 text-[12.5px]">
            <div className="flex justify-between p-2 rounded bg-sidebar border border-default"><span className="text-tertiary">Red if delay ≥</span><span>{RAG_THRESHOLDS.redDelay} days</span></div>
            <div className="flex justify-between p-2 rounded bg-sidebar border border-default"><span className="text-tertiary">Amber if delay ≥</span><span>{RAG_THRESHOLDS.amberDelay} days</span></div>
          </div>
        </Card>
        <Card title="Utilization Thresholds (configurable)">
          <div className="space-y-2 text-[12.5px]">
            <div className="flex justify-between p-2 rounded bg-sidebar border border-default"><span className="text-tertiary">Overloaded above</span><span>{pct(UTIL_THRESHOLDS.overloaded)}</span></div>
            <div className="flex justify-between p-2 rounded bg-sidebar border border-default"><span className="text-tertiary">Healthy below</span><span>{pct(UTIL_THRESHOLDS.healthy)}</span></div>
          </div>
        </Card>
        <Card title="Roles & Permission Matrix" className="col-span-2">
          <table className="w-full text-[12px]">
            <thead><tr className="text-muted uppercase text-[10.5px] border-b border-default"><th className="text-left py-2">Role</th><th className="text-left py-2">Permissions</th></tr></thead>
            <tbody>
              {Object.entries(ROLES).map(([k, v]) => (
                <tr key={k} className="border-b border-default last:border-0">
                  <td className="py-2 font-medium">{v.label}</td>
                  <td className="py-2 text-tertiary text-[11px]">{v.perms.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Resource Capacity" className="col-span-2">
          {resources.length === 0 && <div className="text-[12px] text-muted">No resource data yet.</div>}
          {resources.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded bg-sidebar border border-default mb-2 last:mb-0">
              <div>
                <div className="text-[12.5px] font-medium">{r.name} <span className="text-muted font-normal">· {r.role}</span></div>
                <div className="text-[11px] text-muted mt-0.5">{r.projects}</div>
              </div>
              <Pill color={r.allocated >= UTIL_THRESHOLDS.overloaded ? RAG_COLOR.Red : r.allocated >= UTIL_THRESHOLDS.healthy ? RAG_COLOR.Amber : RAG_COLOR.Green}>{pct(r.allocated)}</Pill>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
