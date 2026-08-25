import { Pill } from "../components/ui";
import { accentFor, fmtDate, pct, taskStatusKey, TASK_STATUS_COLORS } from "../utils";
import { UTIL_THRESHOLDS } from "../sampleData";
import { RAG_COLOR } from "../theme";

const STATUS_CYCLE = ["Not Started", "In Progress", "Blocked", "Done"];

export default function TeamBoard({ tasks, resources, onOpenProject, onCycleStatus }) {
  const members = resources.map((r) => ({
    ...r,
    tasks: tasks.filter((t) => t.owner === r.name),
  }));

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-xl font-bold">Team Board</h1>
        <p className="text-[13px] text-muted mt-1">
          Manager view — click a task's status badge to cycle it (saves live to the database). Click the task itself to open its project.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 bg-panel border border-default rounded-md p-3">
        {Object.values(TASK_STATUS_COLORS).map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-[12px] text-secondary">
            <span className="w-3 h-3 rounded-sm" style={{ background: s.bg, border: `1px solid ${s.border}` }} />
            {s.label}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {members.length === 0 && <div className="text-[12px] text-muted">No team members loaded yet.</div>}
        {members.map((m) => (
          <div key={m.name} className="bg-panel border border-default rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold text-white" style={{ background: accentFor(m.name) }}>
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-[13px] font-semibold">{m.name}</div>
                  <div className="text-[11px] text-muted">{m.role}</div>
                </div>
              </div>
              <Pill color={m.allocated >= UTIL_THRESHOLDS.overloaded ? RAG_COLOR.Red : m.allocated >= UTIL_THRESHOLDS.healthy ? RAG_COLOR.Amber : RAG_COLOR.Green}>
                {pct(m.allocated)} utilized
              </Pill>
            </div>

            {m.tasks.length === 0 ? (
              <div className="text-[11.5px] text-dim">No tasks currently assigned.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {m.tasks.map((t, i) => {
                  const s = TASK_STATUS_COLORS[taskStatusKey(t)];
                  return (
                    <div
                      key={t.id ?? i}
                      className="px-3 py-2 rounded-md text-[11.5px] max-w-[240px] cursor-pointer"
                      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
                      title={t.project}
                      onClick={() => onOpenProject(t.project)}
                    >
                      <div className="font-medium truncate">{t.task}</div>
                      <div className="text-[10.5px] opacity-80 truncate mt-0.5">{t.project} · due {fmtDate(t.finish)}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status) + 1) % STATUS_CYCLE.length];
                          onCycleStatus(t.id, next);
                        }}
                        className="mt-1.5 text-[10px] font-semibold underline opacity-90 hover:opacity-100"
                      >
                        {t.status} → click to advance
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
