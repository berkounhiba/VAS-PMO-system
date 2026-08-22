import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, RadialBarChart, RadialBar, PolarAngleAxis
} from "recharts";
import {
  LayoutGrid, User, FolderKanban, ShieldAlert, GitBranch, FlaskConical,
  Rocket, Building2, CalendarClock, Bot, Settings, Search, Bell, ChevronRight,
  ChevronDown, AlertTriangle, CheckCircle2, Clock, Send, Sparkles, Lock,
  ArrowUpRight, X, Filter, RefreshCw, Sun, Moon
} from "lucide-react";

/* ============================================================
   DATA LAYER
   In production this entire block is replaced by API calls:
   GET /api/projects, GET /api/risks, GET /api/kpis ...
   Everything below is the sample dataset imported from the
   supplied Excel workbook (treated as seed/demo data only).
============================================================= */

const PROJECTS = [
  { id: "P001", name: "USSD/CGW Consolidation", domain: "USSD/CGW", business: "VAS Business", lead: "Fatah", priority: "Critical", status: "Delayed", phase: "UAT", progress: 0.78, plannedStart: "2026-01-07", plannedFinish: "2026-07-15", forecastFinish: "2026-08-10", delayDays: 26, health: "Red", blocker: "Security and backup validation pending", nextAction: "Close security actions and confirm UAT plan", escalation: "Director escalation required", remarks: "Site 1 SIT closed; Site 2 integration nearly complete" },
  { id: "P002", name: "Offer on the Fly - Sprint 2", domain: "Product Catalog", business: "IT", lead: "Ishak", priority: "High", status: "On Track", phase: "Development", progress: 0.55, plannedStart: "2026-06-15", plannedFinish: "2026-09-15", forecastFinish: "2026-09-15", delayDays: 0, health: "Green", blocker: "None", nextAction: "Finalize CRUD API and dynamic dump generation", escalation: "No", remarks: "Engine delivered; GUI scope ongoing" },
  { id: "P003", name: "Commission Centralization Engine", domain: "Commission", business: "Sales", lead: "Nesrine", priority: "High", status: "Delayed", phase: "Technical Validation", progress: 0.72, plannedStart: "2026-03-01", plannedFinish: "2026-07-20", forecastFinish: "2026-08-05", delayDays: 16, health: "Amber", blocker: "DBA validation pending", nextAction: "Validate scripts and complete UAT dataset", escalation: "Escalate DBA response if overdue", remarks: "GET/APPLY procedures under validation" },
  { id: "P004", name: "Bundle USSD 11.9", domain: "USSD", business: "Marketing", lead: "Amir", priority: "—", status: "Not Set", phase: "—", progress: null, plannedStart: null, plannedFinish: null, forecastFinish: null, delayDays: null, health: "Unknown", blocker: "No baseline data submitted yet", nextAction: "Request planning data from Tech Lead", escalation: "No", remarks: "Incomplete record — flagged for data owner" },
  { id: "P005", name: "Flag V1.1", domain: "USSD", business: "Marketing", lead: "Amir", priority: "High", status: "Blocked", phase: "UAT Preparation", progress: 0.45, plannedStart: "2026-04-29", plannedFinish: "2026-07-08", forecastFinish: "2026-08-20", delayDays: 43, health: "Red", blocker: "Updated planning and technical details missing", nextAction: "Obtain revised dates and finalize UAT scenarios", escalation: "Yes", remarks: "Original planned date not respected" },
  { id: "P006", name: "Arcane V1.0 WP2", domain: "Product Catalog", business: "Marketing", lead: "Amir", priority: "High", status: "Delayed", phase: "Development", progress: 0.6, plannedStart: "2026-06-04", plannedFinish: "2026-07-01", forecastFinish: "2026-08-12", delayDays: 42, health: "Red", blocker: "Late E2E solution and competing Go-Live activities", nextAction: "Confirm remaining effort and revised delivery date", escalation: "Yes", remarks: "Payment source changes ongoing" },
  { id: "P007", name: "Multiverse V1.1 WP4", domain: "USSD", business: "Marketing", lead: "Ahmed", priority: "Medium", status: "On Track", phase: "Planning", progress: 0.2, plannedStart: "2026-07-20", plannedFinish: "2026-09-05", forecastFinish: "2026-09-05", delayDays: 0, health: "Green", blocker: "Dependency on Arcane/TOD", nextAction: "Align coordinated launch plan", escalation: "No", remarks: "Launch dependency monitored" },
  { id: "P008", name: "Energy 1.6", domain: "USSD", business: "Marketing", lead: "Karima", priority: "Medium", status: "On Hold", phase: "Specification", progress: 0.15, plannedStart: "2026-05-05", plannedFinish: "2026-08-15", forecastFinish: "2026-09-30", delayDays: 46, health: "Amber", blocker: "Business scope confirmation", nextAction: "Confirm menu decommissioning approach", escalation: "No", remarks: "Digital-only activation alignment" },
  { id: "P009", name: "ATC Loan Phase 2", domain: "ATC", business: "Marketing", lead: "Ahmed", priority: "Medium", status: "Not Started", phase: "Feasibility", progress: 0.05, plannedStart: "2026-08-01", plannedFinish: "2026-10-15", forecastFinish: "2026-10-15", delayDays: 0, health: "Green", blocker: "Instagram channel detailed scope pending", nextAction: "Request detailed workflow and estimation", escalation: "No", remarks: "Same loan logic expected" },
];

const MILESTONES = [
  { project: "USSD/CGW Consolidation", name: "Site 1 UAT completion", owner: "Amir", planned: "2026-07-15", forecast: "2026-08-10", status: "Delayed" },
  { project: "Offer on the Fly - Sprint 2", name: "CRUD API ready", owner: "Ahmed", planned: "2026-08-10", forecast: "2026-08-10", status: "On Track" },
  { project: "Commission Centralization Engine", name: "DBA validation", owner: "Nesrine", planned: "2026-07-20", forecast: "2026-08-05", status: "Delayed" },
  { project: "Flag V1.1", name: "UAT scenarios approved", owner: "Karima", planned: "2026-07-05", forecast: "2026-08-08", status: "Blocked" },
  { project: "Arcane V1.0 WP2", name: "Development completion", owner: "Amir", planned: "2026-07-01", forecast: "2026-08-12", status: "Delayed" },
  { project: "Multiverse V1.1 WP4", name: "Launch readiness", owner: "Ahmed", planned: "2026-09-05", forecast: "2026-09-05", status: "On Track" },
];

const TASKS = [
  { project: "USSD/CGW Consolidation", task: "Close security audit findings", owner: "Amir", priority: "Critical", status: "In Progress", start: "2026-07-20", finish: "2026-07-31", progress: 0.65, dependency: "Security team", comments: "Daily follow-up required" },
  { project: "USSD/CGW Consolidation", task: "Prepare UAT execution plan", owner: "Karima", priority: "High", status: "In Progress", start: "2026-07-22", finish: "2026-08-02", progress: 0.5, dependency: "Security closure", comments: "Draft available" },
  { project: "Commission Centralization Engine", task: "Validate GETCOMMISSION1 test cases", owner: "Nesrine", priority: "High", status: "In Progress", start: "2026-07-21", finish: "2026-07-29", progress: 0.7, dependency: "DBA review", comments: "Accent-insensitive region tests included" },
  { project: "Flag V1.1", task: "Prepare UAT scenarios", owner: "Karima", priority: "High", status: "Blocked", start: "2026-07-10", finish: "2026-07-25", progress: 0.35, dependency: "Updated solution", comments: "Waiting for revised dates" },
  { project: "Arcane V1.0 WP2", task: "Implement allowed_payment_source", owner: "Amir", priority: "High", status: "In Progress", start: "2026-07-01", finish: "2026-08-05", progress: 0.6, dependency: "E2E solution", comments: "Development ongoing" },
  { project: "Offer on the Fly - Sprint 2", task: "Design dynamic dump generation", owner: "Ahmed", priority: "Medium", status: "In Progress", start: "2026-07-15", finish: "2026-08-15", progress: 0.45, dependency: "CRUD API", comments: "On track" },
  { project: "ATC Loan Phase 2", task: "Clarify Instagram channel workflow", owner: "Ahmed", priority: "Medium", status: "Not Started", start: "2026-08-01", finish: "2026-08-08", progress: 0, dependency: "Business details", comments: "Pending specification" },
];

const RESOURCES = [
  { name: "Amir", role: "Senior VAS Engineer", skills: "USSD, Product Catalog, Integration, Tshoot, APIs", capacity: 1, allocated: 0.95, projects: "Flag, USSD/CGW, Arcane" },
  { name: "Islem", role: "Expert VAS", skills: "USSD, Product Catalog, Integration, Tshoot, APIs", capacity: 1, allocated: 0.5, projects: "PRISM WP2" },
  { name: "Imane", role: "Senior VAS Engineer", skills: "USSD, Product Catalog, Integration, APIs", capacity: 1, allocated: 0.65, projects: "Energy 1.6" },
  { name: "Nesrine", role: "VAS Business Manager", skills: "PMO, Commission, Technical Validation", capacity: 1, allocated: 0.9, projects: "Commission Engine, Portfolio Governance" },
  { name: "Ishak", role: "Senior VAS Engineer", skills: "USSD, Product Catalog, Integration, Script, ATC", capacity: 1, allocated: 0.5, projects: "*200# enhancement SITs" },
  { name: "Fatah", role: "Consultant VAS Senior", skills: "USSD, CGW", capacity: 1, allocated: 0.5, projects: "USSD Consolidation" },
  { name: "Ahmed", role: "Consultant VAS Junior", skills: "Product Catalog, USSD Dev", capacity: 1, allocated: 0.8, projects: "Offer on the Fly, Multiverse, ATC Loan" },
  { name: "Karima", role: "VAS Engineer", skills: "UAT, Product Catalog", capacity: 1, allocated: 0.75, projects: "Flag V1.1, Energy 1.6" },
];

const RISKS = [
  { id: "R001", project: "USSD/CGW Consolidation", risk: "Security validation delays UAT and Go-Live", probability: "High", impact: "High", score: 9, mitigation: "Daily review with security and vendor", owner: "Amir", status: "Open" },
  { id: "R002", project: "Flag V1.1", risk: "Missing updated planning may impact business launch", probability: "High", impact: "High", score: 9, mitigation: "Escalate and agree revised baseline", owner: "Karima", status: "Open" },
  { id: "R003", project: "Arcane V1.0 WP2", risk: "Parallel Go-Live workload reduces development capacity", probability: "High", impact: "Medium", score: 6, mitigation: "Reprioritize workload and freeze scope", owner: "Nesrine", status: "Open" },
  { id: "R004", project: "Commission Centralization Engine", risk: "Late DBA validation delays UAT", probability: "Medium", impact: "High", score: 6, mitigation: "Book validation session and escalation deadline", owner: "Nesrine", status: "Open" },
  { id: "R005", project: "Multiverse V1.1 WP4", risk: "Dependency on Arcane causes coordinated launch risk", probability: "Medium", impact: "Medium", score: 4, mitigation: "Joint launch planning", owner: "Ahmed", status: "Monitoring" },
];

const DEPENDENCIES = [
  { project: "Multiverse V1.1 WP4", dependsOn: "Arcane V1.0 WP2", critical: true, owner: "Ahmed", status: "Open", target: "2026-08-12" },
  { project: "Flag V1.1", dependsOn: "Updated E2E solution", critical: true, owner: "Karima", status: "Blocked", target: "2026-08-01" },
  { project: "USSD/CGW Consolidation", dependsOn: "Security Audit Closure", critical: true, owner: "Amir", status: "In Progress", target: "2026-07-31" },
  { project: "Offer on the Fly - Sprint 2", dependsOn: "CRUD API", critical: false, owner: "Ahmed", status: "In Progress", target: "2026-08-10" },
];

const UATSIT = [
  { project: "USSD/CGW Consolidation", module: "USSD", sit: 1, uat: 0.45, openDefects: 8, criticalDefects: 2, ready: false },
  { project: "Commission Centralization Engine", module: "Commission Rules", sit: 0.9, uat: 0.55, openDefects: 5, criticalDefects: 1, ready: false },
  { project: "Flag V1.1", module: "Product Display", sit: 0.6, uat: 0.1, openDefects: 12, criticalDefects: 3, ready: false },
  { project: "Arcane V1.0 WP2", module: "Payment Source", sit: 0.75, uat: 0.3, openDefects: 7, criticalDefects: 1, ready: false },
  { project: "Offer on the Fly - Sprint 2", module: "GUI/API", sit: 0.4, uat: 0, openDefects: 2, criticalDefects: 0, ready: false },
];

const GOLIVE = [
  { project: "USSD/CGW Consolidation", rfc: "Draft", mop: "In Progress", rollback: "Draft", monitoring: "Pending", businessSignoff: "Pending", techSignoff: "Pending", ready: false },
  { project: "Commission Centralization Engine", rfc: "Not Started", mop: "Draft", rollback: "Draft", monitoring: "Planned", businessSignoff: "Pending", techSignoff: "Pending", ready: false },
  { project: "Flag V1.1", rfc: "Not Started", mop: "Not Started", rollback: "Not Started", monitoring: "Not Started", businessSignoff: "Pending", techSignoff: "Pending", ready: false },
  { project: "Offer on the Fly - Sprint 2", rfc: "Not Started", mop: "Not Started", rollback: "Not Started", monitoring: "Planned", businessSignoff: "Pending", techSignoff: "Pending", ready: false },
];

const VENDORS = [
  { vendor: "OpenCode", project: "USSD/CGW Consolidation", action: "Close security and backup findings", owner: "Amir", sent: "2026-07-20", due: "2026-07-28", daysOpen: 7, status: "Overdue" },
  { vendor: "OpenCode", project: "Offer on the Fly - Sprint 2", action: "Share updated GUI delivery planning", owner: "Ahmed", sent: "2026-07-22", due: "2026-07-30", daysOpen: 5, status: "Open" },
  { vendor: "DBA Team", project: "Commission Centralization Engine", action: "Validate stored procedures and indexes", owner: "Nesrine", sent: "2026-07-18", due: "2026-07-27", daysOpen: 8, status: "Overdue" },
  { vendor: "E2E Solution", project: "Flag V1.1", action: "Share revised solution and dates", owner: "Karima", sent: "2026-07-15", due: "2026-07-25", daysOpen: 10, status: "Overdue" },
];

const MEETINGS = [
  { date: "2026-07-27", project: "Portfolio", topic: "Weekly VAS PMO Review", decision: "Escalate Flag and USSD delays", action: "Send consolidated action tracker", owner: "Nesrine", due: "2026-07-27", status: "Open" },
  { date: "2026-07-28", project: "Commission Centralization Engine", topic: "DBA Validation", decision: "Review procedure performance", action: "Confirm index recommendations", owner: "Nesrine", due: "2026-07-29", status: "Planned" },
  { date: "2026-07-29", project: "USSD/CGW Consolidation", topic: "Security Closure", decision: "Prioritize critical findings", action: "Confirm UAT entry criteria", owner: "Amir", due: "2026-07-31", status: "Planned" },
];

const KPI_HISTORY = [
  { month: "Apr", OTD: 78, delay: 4.2, FTR: 82, UAT: 76, SLA: 70 },
  { month: "May", OTD: 74, delay: 5.1, FTR: 80, UAT: 72, SLA: 68 },
  { month: "Jun", OTD: 69, delay: 6.4, FTR: 77, UAT: 70, SLA: 65 },
  { month: "Jul", OTD: 63, delay: 8.0, FTR: 75, UAT: 66, SLA: 58 },
];

// Configurable thresholds (Section 9 / 48 — Admin-editable in a real build)
const RAG_THRESHOLDS = { redDelay: 20, amberDelay: 5 };
const UTIL_THRESHOLDS = { overloaded: 0.9, healthy: 0.75 };

// Roles (Section 5) — permission matrix, not hard-coded logic branches
const ROLES = {
  executive: { label: "Director / Executive", user: "Yacine (Director)", perms: ["view_portfolio", "view_kpi", "view_risk"] },
  pmo: { label: "PMO Analyst", user: "Nesrine", perms: ["view_portfolio", "view_kpi", "view_risk", "manage_kpi", "manage_risk", "resolve_conflict", "generate_reports"] },
  pm: { label: "Project Manager", user: "Karima", perms: ["view_portfolio", "manage_tasks", "manage_milestones", "manage_risk"] },
  engineer: { label: "Engineer", user: "Amir", perms: ["view_assigned", "update_tasks"] },
  admin: { label: "System Administrator", user: "IT Admin", perms: ["*"] },
};

const RAG_COLOR = { Red: "#FF4D6D", Amber: "#FFB020", Green: "#2ECC71", Unknown: "#9296C9" };

/* ============================================================
   THEME
   Every color used anywhere in the app is defined ONCE here as a
   CSS variable, then consumed via plain utility classes below
   (bg-app, text-primary, border-default, ...). To re-theme the
   whole app, edit only this block — nothing else needs to change.
   This is real CSS (not Tailwind's bracket-value syntax) on
   purpose: this preview environment doesn't run a Tailwind build
   step, so arbitrary `bg-[#hex]`-style classes are never compiled
   and silently do nothing. Plain CSS custom properties always work.
============================================================= */
const THEME_CSS = `
  .theme-dark {
    --bg-app: #1E2150;
    --bg-sidebar: #191C47;
    --bg-panel: #272B63;
    --bg-input: #323672;
    --bg-active: #333A7C;
    --bg-accent: #5B7CFA;
    --bg-accent-2: #2DD4BF;
    --bg-red: #FF4D6D;
    --bg-amber: #FFB020;
    --bg-warning: #3A2F5C;

    --border-default: #383C7E;
    --border-accent: #5B7CFA;
    --border-warning: #5B4A8A;

    --text-primary: #F5F6FF;
    --text-secondary: #C7CAF2;
    --text-tertiary: #A7ABDD;
    --text-muted: #9296C9;
    --text-dim: #9296C9;
    --text-onaccent: #FFFFFF;
    --text-bubble: #E6E7FA;
    --text-green: #2ECC71;
    --text-amber: #FFB020;
    --text-red: #FF4D6D;
    --text-accent: #8FA6FF;
    --text-warning: #F0C674;

    --shadow-card: 0 1px 2px rgba(10, 8, 40, 0.15), 0 8px 24px rgba(10, 8, 40, 0.22);
  }

  .theme-light {
    --bg-app: #F1F3F9;
    --bg-sidebar: #F8F9FD;
    --bg-panel: #FDFDFE;
    --bg-input: #EEF1FA;
    --bg-active: #E6EBFC;
    --bg-accent: #4A6EF5;
    --bg-accent-2: #14B8A6;
    --bg-red: #EF4444;
    --bg-amber: #F59E0B;
    --bg-warning: #FEF3E2;

    --border-default: #DFE3F0;
    --border-accent: #4A6EF5;
    --border-warning: #F7D9A3;

    --text-primary: #20222E;
    --text-secondary: #565A72;
    --text-tertiary: #767AA0;
    --text-muted: #9498AC;
    --text-dim: #A6AABD;
    --text-onaccent: #FFFFFF;
    --text-bubble: #1F2437;
    --text-green: #15803D;
    --text-amber: #C2680A;
    --text-red: #DC2626;
    --text-accent: #4A5FE0;
    --text-warning: #A2540A;

    --shadow-card: 0 1px 3px rgba(29, 30, 44, 0.05), 0 6px 18px rgba(60, 68, 130, 0.08);
  }

  .bg-app { background-color: var(--bg-app); }
  .bg-sidebar { background-color: var(--bg-sidebar); }
  .bg-panel { background-color: var(--bg-panel); box-shadow: var(--shadow-card); }
  .bg-input { background-color: var(--bg-input); }
  .bg-active { background-color: var(--bg-active); }
  .bg-accent { background-color: var(--bg-accent); }
  .bg-red-solid { background-color: var(--bg-red); }
  .bg-amber-solid { background-color: var(--bg-amber); }
  .bg-warning { background-color: var(--bg-warning); }

  .border-default { border-color: var(--border-default); }
  .border-accent { border-color: var(--border-accent); }
  .border-warning { border-color: var(--border-warning); }

  .text-primary { color: var(--text-primary); }
  .text-secondary { color: var(--text-secondary); }
  .text-tertiary { color: var(--text-tertiary); }
  .text-muted { color: var(--text-muted); }
  .text-dim { color: var(--text-dim); }
  .text-onaccent { color: var(--text-onaccent); }
  .text-bubble { color: var(--text-bubble); }
  .text-green { color: var(--text-green); }
  .text-amber { color: var(--text-amber); }
  .text-red { color: var(--text-red); }
  .text-accent { color: var(--text-accent); }
  .text-warning { color: var(--text-warning); }

  .gradient-accent { background-image: linear-gradient(135deg, var(--bg-accent), var(--bg-accent-2)); }
  .overlay-dim { background-color: rgba(10, 8, 40, 0.55); }

  .hover-bg-input:hover { background-color: var(--bg-input); }
  .hover-bg-active:hover { background-color: var(--bg-active); }
  .hover-text-bubble:hover { color: var(--text-bubble); }
  .hover-text-primary:hover { color: var(--text-primary); }

  .placeholder-dim::placeholder { color: var(--text-dim); }
`;

/* Vivid multi-hue accent set — used for avatars, KPI markers, and chart
   series so the app reads as colorful/lively rather than one flat accent. */
const ACCENT_PALETTE = ["#FF7A45", "#8B5CF6", "#22C55E", "#FB7185", "#FBBF24"];
function accentFor(seed) {
  const s = String(seed || "");
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length];
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function pct(v) {
  if (v === null || v === undefined) return "—";
  return Math.round(v * 100) + "%";
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date(dateStr) - new Date("2026-08-16")) / 86400000;
  return Math.round(diff);
}

/* ============================================================
   PRIMITIVE UI
============================================================= */

function Pill({ color, children }) {
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

function healthColor(h) {
  return RAG_COLOR[h] || RAG_COLOR.Unknown;
}

function Card({ title, subtitle, right, children, className = "" }) {
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

function KpiCard({ label, value, delta, deltaGood, unit = "" }) {
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

/* ============================================================
   PORTFOLIO PULSE — signature element: a segmented status rail
   summarizing the whole portfolio's RAG state at a glance
============================================================= */
function PortfolioPulse() {
  const counts = { Red: 0, Amber: 0, Green: 0, Unknown: 0 };
  PROJECTS.forEach((p) => counts[p.health]++);
  const total = PROJECTS.length;
  const segs = [
    { k: "Red", v: counts.Red, c: RAG_COLOR.Red, label: "Critical" },
    { k: "Amber", v: counts.Amber, c: RAG_COLOR.Amber, label: "At risk" },
    { k: "Green", v: counts.Green, c: RAG_COLOR.Green, label: "On track" },
    { k: "Unknown", v: counts.Unknown, c: RAG_COLOR.Unknown, label: "No data" },
  ];
  return (
    <div className="bg-panel border border-default rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Portfolio Pulse — {total} projects</span>
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

/* ============================================================
   NAVIGATION
============================================================= */
const NAV = [
  { id: "home", label: "My Day", icon: User },
  { id: "exec", label: "Executive Dashboard", icon: LayoutGrid },
  { id: "team", label: "Team Board", icon: LayoutGrid },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "risks", label: "Risks & Dependencies", icon: ShieldAlert },
  { id: "delivery", label: "Delivery Control", icon: FlaskConical },
  { id: "vendors", label: "Vendors", icon: Building2 },
  { id: "meetings", label: "Meetings & Actions", icon: CalendarClock },
  { id: "ai", label: "AI Operations Assistant", icon: Bot },
  { id: "admin", label: "Administration", icon: Settings },
];

function hasPerm(role, perm) {
  const r = ROLES[role];
  return r.perms.includes("*") || r.perms.includes(perm);
}

/* ============================================================
   APP
============================================================= */
export default function App() {
  const [role, setRole] = useState("pmo");
  const [darkMode, setDarkMode] = useState(true);
  const mainRef = useRef(null);
  const [page, setPage] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);
  const currentUser = ROLES[role].user.split(" ")[0].replace(/[()]/g, "");

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [page]);

  const visibleNav = NAV.filter((n) => {
    if (n.id === "admin") return hasPerm(role, "*");
    if (n.id === "team") return role === "pm" || role === "pmo" || role === "admin";
    if (n.id === "vendors" || n.id === "meetings") return role !== "engineer";
    return true;
  });

  return (
    <div className={`w-screen h-screen ${darkMode ? "theme-dark" : "theme-light"} bg-app text-primary flex overflow-hidden`} style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <style>{THEME_CSS}</style>
      {/* SIDEBAR */}
      <aside className="w-[224px] shrink-0 bg-sidebar border-r border-default flex flex-col">
        <div className="px-4 py-4 border-b border-default">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded gradient-accent flex items-center justify-center font-bold text-[12px] text-onaccent">V</div>
            <div>
              <div className="text-[13px] font-bold tracking-tight leading-none">VAS Control Tower</div>
              <div className="text-[10px] text-muted mt-0.5">Ooredoo · Service Operations</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {visibleNav.map((n) => {
            const Icon = n.icon;
            const active = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                  active ? "bg-active text-primary" : "text-tertiary hover:bg-input hover-text-bubble"
                }`}
                style={active ? { borderLeft: "2px solid #6366F1" } : { borderLeft: "2px solid transparent" }}
              >
                <Icon size={15} strokeWidth={2} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-default">
          <div className="text-[10px] text-muted mb-1.5 px-1 uppercase tracking-wider">Role (demo switcher)</div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-input border border-default rounded px-2 py-1.5 text-[12px] text-primary"
          >
            {Object.entries(ROLES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-14 border-b border-default flex items-center justify-between px-5 shrink-0 bg-app">
          <div className="flex items-center gap-2 bg-input border border-default rounded px-3 py-1.5 w-[340px]">
            <Search size={14} className="text-muted" />
            <input placeholder="Search projects, risks, vendors, people…" className="bg-transparent outline-none text-[12px] placeholder-dim w-full" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="flex items-center gap-1.5 text-tertiary hover-text-primary border border-default rounded px-2.5 py-1.5 text-[11px] font-medium"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              {darkMode ? "Light" : "Dark"}
            </button>
            <button className="relative text-tertiary hover-text-primary">
              <Bell size={17} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-solid text-[9px] font-bold flex items-center justify-center text-white">4</span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-default">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white" style={{ background: accentFor(currentUser) }}>
                {currentUser.slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-none">
                <div className="text-[12px] font-medium">{ROLES[role].user}</div>
                <div className="text-[10px] text-muted">{ROLES[role].label}</div>
              </div>
            </div>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto p-6">
          {page === "home" && <MyDay role={role} currentUser={currentUser} onOpenProject={(p) => { setSelectedProject(p); setPage("projects"); }} />}
          {page === "exec" && <ExecutiveDashboard darkMode={darkMode} />}
          {page === "team" && (role === "pm" || role === "pmo" || role === "admin") && <TeamBoard onOpenProject={(p) => { setSelectedProject(p); setPage("projects"); }} />}
          {page === "team" && !(role === "pm" || role === "pmo" || role === "admin") && <NoAccess />}
          {page === "projects" && <Projects role={role} selected={selectedProject} setSelected={setSelectedProject} />}
          {page === "risks" && <RisksDependencies />}
          {page === "delivery" && <DeliveryControl />}
          {page === "vendors" && <Vendors role={role} />}
          {page === "meetings" && <Meetings />}
          {page === "ai" && <AIAssistant currentUser={currentUser} />}
          {page === "admin" && hasPerm(role, "*") && <Admin />}
          {page === "admin" && !hasPerm(role, "*") && <NoAccess />}
        </main>
      </div>
    </div>
  );
}

function NoAccess() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted">
      <Lock size={28} />
      <div className="text-[14px] font-medium text-secondary">Your role does not have access to this section.</div>
      <div className="text-[12px]">Contact a System Administrator if you believe this is incorrect.</div>
    </div>
  );
}

/* ============================================================
   MY DAY — personalized landing page (Section 17 / 20)
============================================================= */
function MyDay({ role, currentUser, onOpenProject }) {
  const myTasks = TASKS.filter((t) => t.owner === currentUser);
  const overdue = myTasks.filter((t) => daysUntil(t.finish) < 0 && t.status !== "Done");
  const dueSoon = myTasks.filter((t) => daysUntil(t.finish) >= 0 && daysUntil(t.finish) <= 5);
  const myMilestones = MILESTONES.filter((m) => m.owner === currentUser);
  const myMeetings = MEETINGS.filter((m) => m.owner === currentUser);
  const myVendorActions = VENDORS.filter((v) => v.owner === currentUser);
  const myRisks = RISKS.filter((r) => r.owner === currentUser);

  const isPersonal = role === "engineer" || role === "pm";

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h1 className="text-xl font-bold">Good to see you, {currentUser}</h1>
        <p className="text-[13px] text-muted mt-1">Saturday briefing · 16 Aug 2026 · prioritized by deadline, dependency and project health, not just due date</p>
      </div>

      {!isPersonal && (
        <div className="bg-input border border-default rounded-md p-3 text-[12px] text-secondary flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          As {ROLES[role].label.toLowerCase()}, your day view mixes personal items with portfolio-wide attention items below.
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Overdue" value={overdue.length} />
        <KpiCard label="Due this week" value={dueSoon.length} />
        <KpiCard label="Meetings today/upcoming" value={myMeetings.length} />
        <KpiCard label="Risks owned" value={myRisks.length} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Must do" subtitle="Overdue or blocked — needs action today">
          {overdue.length === 0 && myTasks.filter(t=>t.status==="Blocked").length === 0 && (
            <div className="text-[12px] text-muted">Nothing overdue. Good position.</div>
          )}
          <div className="space-y-2">
            {[...overdue, ...myTasks.filter((t) => t.status === "Blocked" && !overdue.includes(t))].map((t, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-2.5 rounded bg-sidebar border border-default">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium truncate">{t.task}</div>
                  <button onClick={() => onOpenProject(t.project)} className="text-[11px] text-accent hover:underline">{t.project}</button>
                </div>
                <Pill color={t.status === "Blocked" ? RAG_COLOR.Red : RAG_COLOR.Amber}>{t.status === "Blocked" ? "Blocked" : `${Math.abs(daysUntil(t.finish))}d late`}</Pill>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Should do" subtitle="Due within 5 days">
          {dueSoon.length === 0 && <div className="text-[12px] text-muted">Nothing due this week.</div>}
          <div className="space-y-2">
            {dueSoon.map((t, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-2.5 rounded bg-sidebar border border-default">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium truncate">{t.task}</div>
                  <button onClick={() => onOpenProject(t.project)} className="text-[11px] text-accent hover:underline">{t.project}</button>
                </div>
                <span className="text-[11px] text-muted shrink-0">Due {fmtDate(t.finish)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Meetings" subtitle="Where you are the owner of a decision or action">
          {myMeetings.length === 0 && <div className="text-[12px] text-muted">No meetings assigned to you.</div>}
          <div className="space-y-2">
            {myMeetings.map((m, i) => (
              <div key={i} className="p-2.5 rounded bg-sidebar border border-default">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-medium">{m.topic}</span>
                  <span className="text-[11px] text-muted">{fmtDate(m.date)}</span>
                </div>
                <div className="text-[11.5px] text-tertiary mt-1">Action: {m.action}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Vendor actions & risks you own">
          {myVendorActions.length === 0 && myRisks.length === 0 && <div className="text-[12px] text-muted">Nothing owned right now.</div>}
          <div className="space-y-2">
            {myVendorActions.map((v, i) => (
              <div key={"v"+i} className="flex items-center justify-between p-2.5 rounded bg-sidebar border border-default">
                <div className="text-[12.5px]">{v.vendor} — {v.action}</div>
                <Pill color={v.status === "Overdue" ? RAG_COLOR.Red : RAG_COLOR.Amber}>{v.status}</Pill>
              </div>
            ))}
            {myRisks.map((r, i) => (
              <div key={"r"+i} className="flex items-center justify-between p-2.5 rounded bg-sidebar border border-default">
                <div className="text-[12.5px]">{r.risk}</div>
                <Pill color={r.score >= 9 ? RAG_COLOR.Red : r.score >= 6 ? RAG_COLOR.Amber : RAG_COLOR.Green}>Score {r.score}</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   EXECUTIVE DASHBOARD (Section 16)
============================================================= */
function ExecutiveDashboard({ darkMode }) {
  const total = PROJECTS.length;
  const onTrack = PROJECTS.filter((p) => p.health === "Green").length;
  const delayed = PROJECTS.filter((p) => p.status === "Delayed").length;
  const blocked = PROJECTS.filter((p) => p.status === "Blocked").length;
  const avgDelay = (PROJECTS.reduce((s, p) => s + (p.delayDays || 0), 0) / total).toFixed(1);
  const goLiveReady = GOLIVE.filter((g) => g.ready).length;
  const criticalRisks = RISKS.filter((r) => r.score >= 9).length;
  const overdueVendors = VENDORS.filter((v) => v.status === "Overdue").length;

  const [whyOpen, setWhyOpen] = useState(false);
  const chart = darkMode
    ? { grid: "#383C7E", axis: "#9296C9", tooltipBg: "#272B63", tooltipText: "#F5F6FF" }
    : { grid: "#DFE3F0", axis: "#767AA0", tooltipBg: "#FDFDFE", tooltipText: "#20222E" };

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Executive Dashboard</h1>
          <p className="text-[13px] text-muted mt-1">Portfolio-wide view · read-only for Director/Executive role</p>
        </div>
        <Pill color={RAG_COLOR.Red}>Overall Health: Critical</Pill>
      </div>

      <PortfolioPulse />

      <div className="grid grid-cols-6 gap-3">
        <KpiCard label="Total Projects" value={total} />
        <KpiCard label="On Track" value={onTrack} />
        <KpiCard label="Delayed" value={delayed} />
        <KpiCard label="Blocked" value={blocked} />
        <KpiCard label="Critical Risks" value={criticalRisks} />
        <KpiCard label="Go-Live Ready" value={`${goLiveReady}/${GOLIVE.length}`} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card title="On-Time Delivery Trend" className="col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={KPI_HISTORY}>
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
        </Card>

        <Card title="Risk Heatmap" subtitle="Probability × Impact">
          <RiskHeatmap />
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card title="Delayed / Blocked Projects" className="col-span-2">
          <div className="space-y-1.5">
            {PROJECTS.filter((p) => p.status === "Delayed" || p.status === "Blocked").map((p) => (
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
              <span className="text-tertiary">Director escalations required</span>
              <span className="font-semibold text-red">{PROJECTS.filter(p=>p.escalation && p.escalation !== "No").length}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-tertiary">Team utilization (avg)</span>
              <span className="font-semibold">{pct(RESOURCES.reduce((s,r)=>s+(r.allocated||0),0)/RESOURCES.length)}</span>
            </div>
          </div>
        </Card>
      </div>

      {whyOpen && <WhyDrawer onClose={() => setWhyOpen(false)} />}
    </div>
  );
}

function RiskHeatmap() {
  const levels = ["Low", "Medium", "High"];
  const grid = {};
  levels.forEach((p) => levels.forEach((i) => (grid[`${p}-${i}`] = [])));
  RISKS.forEach((r) => {
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
              <div key={i} className="aspect-square rounded flex items-center justify-center text-[13px] font-bold" style={{ background: color + "26", border: `1px solid ${color}55`, color }} title={cell.map(c=>c.risk).join(", ")}>
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

function WhyDrawer({ onClose }) {
  const contributors = PROJECTS.filter(p => p.delayDays > 0).sort((a,b)=>b.delayDays-a.delayDays);
  return (
    <div className="fixed inset-0 overlay-dim flex justify-end z-50" onClick={onClose}>
      <div className="w-[420px] h-full bg-sidebar border-l border-default p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[14px]">Why is On-Time Delivery declining?</h3>
          <button onClick={onClose}><X size={16} className="text-muted" /></button>
        </div>
        <div className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-2">Facts (from system records)</div>
        <p className="text-[12.5px] text-secondary mb-4">OTD fell from 78% in April to 63% in July, a 15-point decline over 4 months, alongside vendor SLA compliance dropping from 70% to 58%.</p>
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
        </div>
        <div className="text-[11px] uppercase tracking-wider text-amber font-semibold mb-2">Analysis (inferred)</div>
        <p className="text-[12.5px] text-secondary">Three of five delayed projects cite third-party dependencies (security vendor, DBA team, E2E solution) as the blocking factor — vendor SLA compliance and delivery performance appear to be moving together this quarter.</p>
      </div>
    </div>
  );
}

/* ============================================================
   PROJECTS (Section 7)
============================================================= */
function Projects({ role, selected, setSelected }) {
  const [filterHealth, setFilterHealth] = useState("All");
  const list = PROJECTS.filter((p) => filterHealth === "All" || p.health === filterHealth);
  const detail = PROJECTS.find((p) => p.name === selected);

  if (detail) return <ProjectDetail project={detail} onBack={() => setSelected(null)} />;

  return (
    <div className="space-y-4 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Project Portfolio</h1>
        <div className="flex items-center gap-1.5">
          {["All", "Red", "Amber", "Green", "Unknown"].map((h) => (
            <button key={h} onClick={() => setFilterHealth(h)} className={`px-2.5 py-1 rounded text-[11px] font-medium border ${filterHealth === h ? "bg-active border-accent text-primary" : "border-default text-tertiary"}`}>
              {h}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-panel border border-default rounded-md overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-default text-muted text-[11px] uppercase tracking-wider">
              <th className="text-left px-4 py-2.5 font-medium">Project</th>
              <th className="text-left px-3 py-2.5 font-medium">Lead</th>
              <th className="text-left px-3 py-2.5 font-medium">Phase</th>
              <th className="text-left px-3 py-2.5 font-medium">Progress</th>
              <th className="text-left px-3 py-2.5 font-medium">Delay</th>
              <th className="text-left px-3 py-2.5 font-medium">Health</th>
              <th className="text-left px-3 py-2.5 font-medium">Escalation</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} onClick={() => setSelected(p.name)} className="border-b border-default last:border-0 hover:bg-input cursor-pointer">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[11px] text-muted">{p.id} · {p.domain}</div>
                </td>
                <td className="px-3 py-2.5 text-secondary">{p.lead}</td>
                <td className="px-3 py-2.5 text-secondary">{p.phase}</td>
                <td className="px-3 py-2.5 w-[120px]">
                  {p.progress !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-active rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: pct(p.progress), background: healthColor(p.health) }} />
                      </div>
                      <span className="text-[11px] text-tertiary">{pct(p.progress)}</span>
                    </div>
                  ) : <span className="text-dim">—</span>}
                </td>
                <td className="px-3 py-2.5">{p.delayDays ? <span className="text-red font-medium">{p.delayDays}d</span> : <span className="text-green">on time</span>}</td>
                <td className="px-3 py-2.5"><Pill color={healthColor(p.health)}>{p.health}</Pill></td>
                <td className="px-3 py-2.5 text-[11px] text-secondary max-w-[160px] truncate">{p.escalation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectDetail({ project: p, onBack }) {
  const milestones = MILESTONES.filter((m) => m.project === p.name);
  const tasks = TASKS.filter((t) => t.project === p.name);
  const risks = RISKS.filter((r) => r.project === p.name);
  const deps = DEPENDENCIES.filter((d) => d.project === p.name);
  const uatsit = UATSIT.filter((u) => u.project === p.name);
  const golive = GOLIVE.find((g) => g.project === p.name);
  const vendorActions = VENDORS.filter((v) => v.project === p.name);

  return (
    <div className="space-y-5 max-w-[1200px]">
      <button onClick={onBack} className="text-[12px] text-muted hover-text-primary flex items-center gap-1">
        ← Back to portfolio
      </button>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{p.name}</h1>
            <Pill color={healthColor(p.health)}>{p.health}</Pill>
          </div>
          <p className="text-[12.5px] text-muted mt-1">{p.id} · {p.domain} · {p.business} · Lead: {p.lead}</p>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted">Forecast finish</div>
          <div className="text-[14px] font-semibold">{fmtDate(p.forecastFinish)}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Progress" value={pct(p.progress)} />
        <KpiCard label="Delay" value={p.delayDays ?? "—"} unit={p.delayDays ? "d" : ""} />
        <KpiCard label="Open Risks" value={risks.filter(r=>r.status!=="Closed").length} />
        <KpiCard label="Critical Defects" value={uatsit.reduce((s,u)=>s+u.criticalDefects,0)} />
      </div>

      <Card title="Blocker & Next Action">
        <div className="grid grid-cols-2 gap-4 text-[12.5px]">
          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider mb-1">Current blocker</div>
            <div className="text-red">{p.blocker}</div>
          </div>
          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider mb-1">Next action</div>
            <div>{p.nextAction}</div>
          </div>
        </div>
        {p.remarks && <div className="mt-3 pt-3 border-t border-default text-[12px] text-tertiary">{p.remarks}</div>}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Milestones">
          {milestones.length === 0 ? <Empty /> : milestones.map((m, i) => (
            <RowLine key={i} left={m.name} right={<Pill color={m.status==="On Track"?RAG_COLOR.Green:m.status==="Blocked"?RAG_COLOR.Red:RAG_COLOR.Amber}>{m.status}</Pill>} sub={`Owner: ${m.owner} · Planned ${fmtDate(m.planned)} → Forecast ${fmtDate(m.forecast)}`} />
          ))}
        </Card>
        <Card title="Tasks">
          {tasks.length === 0 ? <Empty /> : tasks.map((t, i) => (
            <RowLine key={i} left={t.task} right={<span className="text-[11px] text-tertiary">{pct(t.progress)}</span>} sub={`${t.owner} · ${t.status} · due ${fmtDate(t.finish)}`} />
          ))}
        </Card>
        <Card title="Risks">
          {risks.length === 0 ? <Empty /> : risks.map((r, i) => (
            <RowLine key={i} left={r.risk} right={<Pill color={r.score>=9?RAG_COLOR.Red:r.score>=6?RAG_COLOR.Amber:RAG_COLOR.Green}>{r.score}</Pill>} sub={`Owner: ${r.owner} · ${r.mitigation}`} />
          ))}
        </Card>
        <Card title="Dependencies">
          {deps.length === 0 ? <Empty /> : deps.map((d, i) => (
            <RowLine key={i} left={d.dependsOn} right={d.critical ? <Pill color={RAG_COLOR.Red}>Critical</Pill> : <Pill color={RAG_COLOR.Amber}>{d.status}</Pill>} sub={`Owner: ${d.owner} · Target ${fmtDate(d.target)}`} />
          ))}
        </Card>
        <Card title="SIT / UAT">
          {uatsit.length === 0 ? <Empty /> : uatsit.map((u, i) => (
            <div key={i} className="p-2.5 rounded bg-sidebar border border-default mb-2 last:mb-0">
              <div className="text-[12.5px] font-medium mb-1.5">{u.module}</div>
              <div className="flex gap-4 text-[11px] text-tertiary">
                <span>SIT {pct(u.sit)}</span><span>UAT {pct(u.uat)}</span>
                <span className="text-red">{u.criticalDefects} critical defects</span>
              </div>
            </div>
          ))}
        </Card>
        <Card title="Go-Live Readiness">
          {!golive ? <Empty /> : (
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {["rfc","mop","rollback","monitoring","businessSignoff","techSignoff"].map((k) => (
                <div key={k} className="flex justify-between p-2 rounded bg-sidebar border border-default">
                  <span className="text-tertiary capitalize">{k.replace(/([A-Z])/g," $1")}</span>
                  <span>{golive[k]}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {vendorActions.length > 0 && (
        <Card title="Vendor Actions">
          {vendorActions.map((v, i) => (
            <RowLine key={i} left={`${v.vendor} — ${v.action}`} right={<Pill color={v.status==="Overdue"?RAG_COLOR.Red:RAG_COLOR.Amber}>{v.status}</Pill>} sub={`Owner: ${v.owner} · Due ${fmtDate(v.due)}`} />
          ))}
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   TEAM BOARD — manager's-eye view: every member and their tasks,
   color-coded by status.
   Done = green · Late = red · Not Started = light purple · In Progress = light green
============================================================= */
const TASK_STATUS_COLORS = {
  done: { bg: "#1B3D4F", border: "#2ECC71", text: "#6EE7A0", label: "Done" },
  late: { bg: "#42213F", border: "#FF4D6D", text: "#FF8FA3", label: "Late" },
  notStarted: { bg: "#332A5C", border: "#B9A7FF", text: "#D9CFFF", label: "Not Started" },
  inProgress: { bg: "#1E3B33", border: "#7CF0C2", text: "#B4FFE0", label: "In Progress" },
};

function taskStatusKey(t) {
  if (t.status === "Done" || t.progress >= 1) return "done";
  const late = daysUntil(t.finish) < 0;
  if (late) return "late";
  if (t.status === "Not Started" || t.progress === 0) return "notStarted";
  return "inProgress";
}

function TeamBoard({ onOpenProject }) {
  const members = RESOURCES.map((r) => ({
    ...r,
    tasks: TASKS.filter((t) => t.owner === r.name),
  }));

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-xl font-bold">Team Board</h1>
        <p className="text-[13px] text-muted mt-1">Manager view — every member's tasks at a glance, color-coded by status.</p>
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
                    <button
                      key={i}
                      onClick={() => onOpenProject(t.project)}
                      className="text-left px-3 py-2 rounded-md text-[11.5px] max-w-[240px]"
                      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
                      title={t.project}
                    >
                      <div className="font-medium truncate">{t.task}</div>
                      <div className="text-[10.5px] opacity-80 truncate mt-0.5">{t.project} · due {fmtDate(t.finish)}</div>
                    </button>
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

function Empty() { return <div className="text-[12px] text-muted">No records linked yet.</div>; }
function RowLine({ left, right, sub }) {
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

/* ============================================================
   RISKS & DEPENDENCIES (Section 10)
============================================================= */
function RisksDependencies() {
  return (
    <div className="space-y-5 max-w-[1200px]">
      <h1 className="text-xl font-bold">Risks & Dependencies</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Risk Register" subtitle="Sorted by severity score">
          {RISKS.slice().sort((a,b)=>b.score-a.score).map((r) => (
            <div key={r.id} className="p-3 rounded bg-sidebar border border-default mb-2 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12.5px] font-medium">{r.risk}</span>
                <Pill color={r.score>=9?RAG_COLOR.Red:r.score>=6?RAG_COLOR.Amber:RAG_COLOR.Green}>Score {r.score}</Pill>
              </div>
              <div className="text-[11px] text-muted mb-1.5">{r.project} · Prob {r.probability} · Impact {r.impact} · Owner {r.owner}</div>
              <div className="text-[11.5px] text-tertiary">Mitigation: {r.mitigation}</div>
            </div>
          ))}
        </Card>
        <Card title="Dependency Map" subtitle="Cross-project blockers">
          {DEPENDENCIES.map((d, i) => (
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
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   DELIVERY CONTROL (Section 11)
============================================================= */
function DeliveryControl() {
  return (
    <div className="space-y-5 max-w-[1200px]">
      <h1 className="text-xl font-bold">Delivery Control — SIT / UAT / Go-Live</h1>
      <Card title="SIT & UAT Progress">
        <div className="space-y-2">
          {UATSIT.map((u, i) => (
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
            {GOLIVE.map((g, i) => (
              <tr key={i} className="border-b border-default last:border-0">
                <td className="py-2.5 font-medium">{g.project}</td>
                <td className="py-2.5 text-secondary">{g.rfc}</td>
                <td className="py-2.5 text-secondary">{g.mop}</td>
                <td className="py-2.5 text-secondary">{g.rollback}</td>
                <td className="py-2.5 text-secondary">{g.monitoring}</td>
                <td className="py-2.5 text-secondary">{g.businessSignoff}</td>
                <td className="py-2.5 text-secondary">{g.techSignoff}</td>
                <td className="py-2.5"><Pill color={g.ready?RAG_COLOR.Green:RAG_COLOR.Red}>{g.ready?"Yes":"No"}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
function ProgressBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted mb-1"><span>{label}</span><span>{pct(value)}</span></div>
      <div className="h-1.5 bg-active rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-accent" style={{ width: pct(value) }} />
      </div>
    </div>
  );
}

/* ============================================================
   VENDORS (Section 12 / 25)
============================================================= */
function Vendors({ role }) {
  const [draftFor, setDraftFor] = useState(null);
  const canGenerate = hasPerm(role, "*") || role === "pmo" || role === "pm";

  return (
    <div className="space-y-5 max-w-[1100px]">
      <h1 className="text-xl font-bold">Vendor Management</h1>
      <Card title="Open & Overdue Vendor Actions">
        <div className="space-y-2">
          {VENDORS.map((v, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3 rounded bg-sidebar border border-default">
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium">{v.vendor} — {v.action}</div>
                <div className="text-[11px] text-muted mt-0.5">{v.project} · Owner {v.owner} · Due {fmtDate(v.due)} · {v.daysOpen} days open</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Pill color={v.status==="Overdue"?RAG_COLOR.Red:RAG_COLOR.Amber}>{v.status}</Pill>
                {canGenerate && (
                  <button onClick={() => setDraftFor(v)} className="text-[11px] font-medium bg-active border border-default px-2.5 py-1.5 rounded hover:bg-active flex items-center gap-1">
                    <Send size={11}/> Draft follow-up
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

/* ============================================================
   MEETINGS
============================================================= */
function Meetings() {
  return (
    <div className="space-y-5 max-w-[1000px]">
      <h1 className="text-xl font-bold">Meetings & Action Items</h1>
      <Card title="Recent & Upcoming">
        {MEETINGS.map((m, i) => (
          <div key={i} className="p-3 rounded bg-sidebar border border-default mb-2 last:mb-0">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium">{m.topic}</span>
              <span className="text-[11px] text-muted">{fmtDate(m.date)}</span>
            </div>
            <div className="text-[11px] text-muted mt-0.5">{m.project}</div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-[11.5px]">
              <div><span className="text-muted">Decision: </span>{m.decision}</div>
              <div><span className="text-muted">Action ({m.owner}): </span>{m.action}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ============================================================
   AI OPERATIONS ASSISTANT (Section 18-29)
   NOTE ON SECURITY: this calls the Anthropic API directly from
   the browser with the sample dataset as context. That pattern
   is fine for demo data. It must NOT be pointed at real internal
   Ooredoo data until Legal/InfoSec sign off on external data
   transfer (see banner below) — a production build would instead
   route through a backend that calls scoped tools per Section 38.
============================================================= */
function AIAssistant({ currentUser }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "I'm the VAS AI Operations Assistant (prototype). I can only see the sample dataset loaded in this demo — ask me about project health, risks, vendor actions, or your day." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const quickPrompts = [
    "What is blocking USSD/CGW Consolidation?",
    "Which projects are at risk of missing Go-Live?",
    "Who is overloaded right now?",
    "Summarize the top risks this week.",
    "Prepare my morning brief.",
  ];

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  async function ask(question) {
    if (!question.trim() || loading) return;
    const newMessages = [...messages, { role: "user", text: question }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const context = { PROJECTS, MILESTONES, TASKS, RESOURCES, RISKS, DEPENDENCIES, UATSIT, GOLIVE, VENDORS, MEETINGS, KPI_HISTORY };
      const systemPrompt = `You are the VAS AI Operations Assistant for a telecom PMO control tower. You are given a JSON snapshot of the SAMPLE/DEMO operational dataset (projects, tasks, risks, vendors, KPIs). Answer the current user's question ONLY using this data — never invent projects, names, or numbers not present in it. Structure your answer with short markdown sections: **Answer**, **Evidence** (cite specific records), and where relevant **Analysis** (clearly inferred, not fact) and **Recommendation** (requires human approval, you cannot take actions). Keep it concise. The current user is ${currentUser}.\n\nDATA:\n${JSON.stringify(context)}`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: question }],
        }),
      });
      const data = await response.json();
      const text = data?.content?.find((b) => b.type === "text")?.text || "I couldn't generate a response.";
      setMessages([...newMessages, { role: "assistant", text }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", text: "Something went wrong reaching the AI layer. In production this call would go through the audited backend AI service, not the browser." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[900px] flex flex-col h-full gap-4">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><Bot size={20} /> VAS AI Operations Assistant</h1>
        <p className="text-[13px] text-muted mt-1">Grounded only in the records shown in this workspace. Facts vs. analysis vs. recommendations are labeled explicitly.</p>
      </div>

      <div className="bg-warning border border-warning rounded-md p-3 text-[11.5px] text-warning flex gap-2">
        <ShieldAlert size={15} className="shrink-0 mt-0.5" />
        <span><strong>Prototype notice:</strong> this assistant sends the demo dataset to the Anthropic API from the browser to generate answers. Do not connect it to real Ooredoo project, employee, or vendor data until Legal/InfoSec has approved external data transfer and a backend with scoped access-controlled tools (Section 38) is in place — this is the same open question already tracked for the internship scheduling tool.</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((q) => (
          <button key={q} onClick={() => ask(q)} className="text-[11.5px] px-2.5 py-1.5 rounded-full border border-default text-secondary hover:bg-input">{q}</button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 min-h-[360px] max-h-[480px] overflow-y-auto bg-panel border border-default rounded-md p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-md px-3 py-2 text-[12.5px] whitespace-pre-wrap ${m.role === "user" ? "bg-accent text-white" : "bg-input border border-default text-bubble"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-[11.5px] text-muted flex items-center gap-2"><RefreshCw size={12} className="animate-spin" /> Analyzing operational data…</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
          placeholder="Ask about a project, risk, vendor, or your day…"
          className="flex-1 bg-input border border-default rounded px-3 py-2.5 text-[12.5px] outline-none focus:border-accent"
        />
        <button onClick={() => ask(input)} className="px-4 rounded bg-accent text-white font-medium text-[12.5px]">Ask</button>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN (Section 48)
============================================================= */
function Admin() {
  return (
    <div className="space-y-5 max-w-[1000px]">
      <h1 className="text-xl font-bold">Administration</h1>
      <p className="text-[13px] text-muted">Visible only to System Administrator. In production this section is backed by real user/role/config tables and a full audit log — not editable here.</p>
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
            <thead><tr className="text-muted uppercase text-[10.5px] border-b border-default"><th className="text-left py-2">Role</th><th className="text-left py-2">Sample user</th><th className="text-left py-2">Permissions</th></tr></thead>
            <tbody>
              {Object.entries(ROLES).map(([k, v]) => (
                <tr key={k} className="border-b border-default last:border-0">
                  <td className="py-2 font-medium">{v.label}</td>
                  <td className="py-2 text-secondary">{v.user}</td>
                  <td className="py-2 text-tertiary text-[11px]">{v.perms.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Resource Capacity" className="col-span-2">
          {RESOURCES.map((r,i) => (
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
