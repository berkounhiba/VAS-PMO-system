/* Vivid multi-hue accent set — used for avatars, KPI markers, and chart
   series so the app reads as colorful/lively rather than one flat accent. */
const ACCENT_PALETTE = ["#FF7A45", "#8B5CF6", "#22C55E", "#FB7185", "#FBBF24"];

export function accentFor(seed) {
  const s = String(seed || "");
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length];
}

export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function pct(v) {
  if (v === null || v === undefined) return "—";
  return Math.round(v * 100) + "%";
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date(dateStr) - new Date()) / 86400000;
  return Math.round(diff);
}

export function taskStatusKey(t) {
  if (t.status === "Done" || t.progress >= 1) return "done";
  const late = daysUntil(t.finish) < 0;
  if (late) return "late";
  if (t.status === "Not Started" || t.progress === 0) return "notStarted";
  return "inProgress";
}

export const TASK_STATUS_COLORS = {
  done: { bg: "#1B3D4F", border: "#2ECC71", text: "#6EE7A0", label: "Done" },
  late: { bg: "#42213F", border: "#FF4D6D", text: "#FF8FA3", label: "Late" },
  notStarted: { bg: "#332A5C", border: "#B9A7FF", text: "#D9CFFF", label: "Not Started" },
  inProgress: { bg: "#1E3B33", border: "#7CF0C2", text: "#B4FFE0", label: "In Progress" },
};

export function fuzzyMatch(query, text) {
  if (!query || !text) return false;
  return String(text).toLowerCase().includes(query.toLowerCase());
}

export function calculateAutoHealth(project, projectTasks, projectMilestones, projectRisks, projectDeps) {
  let score = 100;

  if (project.delayDays > 30) score -= 40;
  else if (project.delayDays > 14) score -= 25;
  else if (project.delayDays > 7) score -= 10;
  else if (project.delayDays > 0) score -= 5;

  const overdueTasks = (projectTasks || []).filter(t => t.finish && new Date(t.finish) < new Date() && t.status !== "Done");
  score -= overdueTasks.length * 8;

  const blockedTasks = (projectTasks || []).filter(t => t.status === "Blocked");
  score -= blockedTasks.length * 12;

  const delayedMilestones = (projectMilestones || []).filter(m => m.status === "Delayed" || m.status === "Blocked");
  score -= delayedMilestones.length * 10;

  const highRisks = (projectRisks || []).filter(r => r.score >= 9 && r.status === "Open");
  score -= highRisks.length * 15;
  const medRisks = (projectRisks || []).filter(r => r.score >= 6 && r.score < 9 && r.status === "Open");
  score -= medRisks.length * 8;

  const blockedDeps = (projectDeps || []).filter(d => d.status === "Blocked");
  score -= blockedDeps.length * 10;

  if (project.progress !== null && project.progress < 0.3 && project.delayDays > 14) score -= 10;

  if (score >= 75) return "Green";
  if (score >= 45) return "Amber";
  return "Red";
}