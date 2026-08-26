import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ChevronRight, X } from "lucide-react";
import { Card, KpiCard, Pill, healthColor } from "../components/ui";
import { RAG_COLOR } from "../theme";

export function PortfolioPulse({ projects }) {
  const counts = { Red: 0, Amber: 0, Green: 0, Unknown: 0 };
  projects.forEach((p) => counts[p.health] = (counts[p.health] ?? 0) + 1);
  const total = projects.length || 1;
  const segs = [
    { k: "Red", v: counts.Red, c: RAG_COLOR.Red, label: "Critical" },
    { k: "Amber", v: counts.Amber, c: RAG_COLOR.Amber, label: "At risk" },
    { k: "Green", v: counts.Green, c: RAG_COLOR.Green, label: "On track" },
    { k: "Unknown", v: counts.Unknown, c: RAG_COLOR.Unknown, label: "No data" },
  ];
  return (
    <div className="bg-panel border border-default rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Portfolio Pulse — {projects.length} projects</span>
        <span className="text-[11px] text-muted">Live from operational data</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden gap-[2px]">
        {segs.filter(s => s.v > 0).map((s) => (
          <div key={s.k} style={{ width: `${(s.v / total) * 100}%`, background: s.c }} title={`${s.label}: ${s.v}`} />
        ))}
      </div>
      <div className="flex gap-5 mt-3 flex-wrap">
        {segs.map((s) => (
          <div key={s.k} className="flex items-center gap-1.5 text-[12px] text-secondary">
            <span className="w-2 h-2 rounded-full" style={{ background: s.c }} />
            {s.label} <span className="text-primary font-semibold">{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RiskHeatmap({ risks }) {
  const levels = ["Low", "Medium", "High"];
  const grid = {};
  levels.forEach((p) => levels.forEach((i) => (grid[`${p}-${i}`] = [])));
  risks.forEach((r) => {
    const key = `${r.probability}-${r.impact}`;
    if (grid[key]) grid[key].push(r);
  });
  return (
    <div className="grid grid-cols-4 gap-1">
      <div />
      {levels.map((i) => <div key={i} className="text-[10px] text-muted text-center">{i}</div>)}
      {levels.slice().reverse().map((p) => (
        <React.Fragment key={p}>
          <div className="text-[10px] text-muted flex items-center">{p}</div>
          {levels.map((i) => {
            const cell = grid[`${p}-${i}`] || [];
            const score = (levels.indexOf(p) + 1) * (levels.indexOf(i) + 1);
            const color = score >= 6 ? RAG_COLOR.Red : score >= 3 ? RAG_COLOR.Amber : RAG_COLOR.Green;
            return (
              <div key={i} className="aspect-square rounded flex items-center justify-center text-[13px] font-bold" style={{ background: color + "26", border: `1px solid ${color}55`, color }} title={cell.map(c => c.risk).join(", ")}>
                {cell.length || ""}
              </div>
            );
          })}
        </React.Fragment>
      ))}
      <div className="col-span-4 text-[10px] text-muted text-center mt-1">Impact →</div>
    </div>
  );
}

function WhyDrawer({ projects, onClose }) {
  const contributors = projects.filter(p => p.delayDays > 0).sort((a, b) => b.delayDays - a.delayDays);
  return (
    <div className="fixed inset-0 overlay-dim flex justify-end z-50" onClick={onClose}>
      <div className="w-[420px] h-full bg-sidebar border-l border-default p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[14px]">Why is On-Time Delivery declining?</h3>
          <button onClick={onClose}><X size={16} className="text-muted" /></button>
        </div>
        <div className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-2">Contributing projects (traced)</div>
        <div className="space-y-2 mb-4">
          {contributors.map(p => (
            <div key={p.id} className="p-2.5 rounded bg-input border border-default">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-medium">{p.name}</span>
                <span className="text-[11px] font-semibold text-red">{p.delayDays}d</span>
              </div>
              <div className="text-[11.5px] text-tertiary mt-1">{p.blocker}</div>
            </div>
          ))}
          {contributors.length === 0 && <div className="text-[12px] text-muted">No delayed projects right now.</div>}
        </div>
      </div>
    </div>
  );
}

export default function ExecutiveDashboard({ darkMode, projects, risks, golive, vendors, kpiHistory }) {
  const total = projects.length;
  // All four counted from the SAME field (status) so they add up to
  // `total` and mean one consistent thing, instead of mixing status
  // and health as two different classification schemes.
  const onTrack = projects.filter((p) => p.status === "On Track").length;
  const delayed = projects.filter((p) => p.status === "Delayed").length;
  const blocked = projects.filter((p) => p.status === "Blocked").length;
  const other = total - onTrack - delayed - blocked; // Not Started / On Hold / etc.
  const avgDelay = total ? (projects.reduce((s, p) => s + (p.delayDays || 0), 0) / total).toFixed(1) : "0";
  const goLiveReady = golive.filter((g) => g.ready).length;
  const criticalRisks = risks.filter((r) => r.score >= 9).length;
  const overdueVendors = vendors.filter((v) => v.status === "Overdue").length;

  // Sort chronologically. `month` is free text like "April 2026" —
  // new Date("April 2026") isn't a guaranteed-parseable format across
  // browsers, so instead of trusting Date() to guess it, build an
  // explicit month-name -> number lookup that always works the same way.
  const MONTH_ORDER = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };
  function monthSortKey(monthStr) {
    const [name, year] = String(monthStr || "").split(" ");
    return (parseInt(year, 10) || 0) * 12 + (MONTH_ORDER[name] ?? 0);
  }
  const sortedKpiHistory = [...kpiHistory].sort(
    (a, b) => monthSortKey(a.month) - monthSortKey(b.month)
  );

  const [whyOpen, setWhyOpen] = useState(false);
  const chart = darkMode
    ? { grid: "#383C7E", axis: "#9296C9", tooltipBg: "#272B63", tooltipText: "#F5F6FF" }
    : { grid: "#DFE3F0", axis: "#767AA0", tooltipBg: "#FDFDFE", tooltipText: "#20222E" };

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Executive Dashboard</h1>
          <p className="text-[13px] text-muted mt-1">Portfolio-wide view</p>
        </div>
      </div>

      <PortfolioPulse projects={projects} />

      <div className="grid grid-cols-7 gap-3">
        <KpiCard label="Total Projects" value={total} />
        <KpiCard label="On Track" value={onTrack} />
        <KpiCard label="Delayed" value={delayed} />
        <KpiCard label="Blocked" value={blocked} />
        <KpiCard label="Other" value={other} />
        <KpiCard label="Critical Risks" value={criticalRisks} />
        <KpiCard label="Go-Live Ready" value={`${goLiveReady}/${golive.length}`} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card title="On-Time Delivery Trend" className="col-span-2">
          {sortedKpiHistory.length === 0 ? (
            <div className="text-[12px] text-muted py-8 text-center">No KPI history recorded yet.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={sortedKpiHistory}>
                  <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ background: chart.tooltipBg, border: `1px solid ${chart.grid}`, fontSize: 12, borderRadius: 8, color: chart.tooltipText, boxShadow: "0 4px 16px rgba(10,8,40,0.15)" }} />
                  <Line type="monotone" dataKey="OTD" stroke="#7C6FF0" strokeWidth={2.5} dot={{ r: 3 }} name="OTD %" />
                  <Line type="monotone" dataKey="SLA" stroke="#EC4899" strokeWidth={2.5} dot={{ r: 3 }} name="Vendor SLA %" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex gap-4 text-[11px] text-tertiary">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#7C6FF0" }} />On-Time Delivery</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#EC4899" }} />Vendor SLA</span>
                </div>
                <button onClick={() => setWhyOpen(true)} className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1">
                  WHY is OTD declining? <ChevronRight size={12} />
                </button>
              </div>
            </>
          )}
        </Card>

        <Card title="Risk Heatmap" subtitle="Probability × Impact">
          <RiskHeatmap risks={risks} />
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card title="Delayed / Blocked Projects" className="col-span-2">
          <div className="space-y-1.5">
            {projects.filter((p) => p.status === "Delayed" || p.status === "Blocked").map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded bg-sidebar border border-default">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-1.5 h-6 rounded-full shrink-0" style={{ background: healthColor(p.health) }} />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium truncate">{p.name}</div>
                    <div className="text-[11px] text-muted truncate">{p.blocker}</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-red shrink-0 ml-2">{p.delayDays}d late</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Vendor & Escalation Watch">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-tertiary">Overdue vendor actions</span>
              <span className="font-semibold text-red">{overdueVendors}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-tertiary">Escalations required</span>
              <span className="font-semibold text-red">{projects.filter(p => p.escalation && p.escalation !== "No").length}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-tertiary">Average delay</span>
              <span className="font-semibold">{avgDelay}d</span>
            </div>
          </div>
        </Card>
      </div>

      {whyOpen && <WhyDrawer projects={projects} onClose={() => setWhyOpen(false)} />}
    </div>
  );
}
