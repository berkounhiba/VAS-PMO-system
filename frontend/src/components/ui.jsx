import { accentFor } from "../utils";
import { RAG_COLOR } from "../theme";

export function Pill({ color, children }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
      style={{ background: color + "18", color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

export function healthColor(h) {
  return RAG_COLOR[h] || RAG_COLOR.Unknown;
}

export function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <div className={`bg-panel border border-default rounded-2xl ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-default">
          <div>
            {title && <h3 className="text-[13.5px] font-bold text-primary tracking-wide">{title}</h3>}
            {subtitle && <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function KpiCard({ label, value, delta, deltaGood, unit = "" }) {
  const accent = accentFor(label);
  return (
    <div className="bg-panel border border-default rounded-2xl p-4 flex flex-col gap-3 min-w-[150px]">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: accent + "1E" }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: accent }} />
      </div>
      <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary tabular-nums">{value}{unit}</span>
        {delta !== undefined && (
          <span
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: deltaGood ? "#2ECC71" : "#FF4D6D" }}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

export function Empty() {
  return <div className="text-[12px] text-muted">No records linked yet.</div>;
}

export function RowLine({ left, right, sub }) {
  return (
    <div className="flex items-start justify-between gap-3 p-2.5 rounded bg-sidebar border border-default mb-2 last:mb-0">
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium truncate">{left}</div>
        {sub && <div className="text-[11px] text-muted mt-0.5">{sub}</div>}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

export function ProgressBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted mb-1"><span>{label}</span><span>{value === undefined ? "—" : Math.round(value * 100) + "%"}</span></div>
      <div className="h-1.5 bg-active rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-accent" style={{ width: value === undefined ? "0%" : Math.round(value * 100) + "%" }} />
      </div>
    </div>
  );
}

export function NoAccess() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted">
      <div className="text-[14px] font-medium text-secondary">Your role does not have access to this section.</div>
      <div className="text-[12px]">Contact an Administrator if you believe this is incorrect.</div>
    </div>
  );
}
