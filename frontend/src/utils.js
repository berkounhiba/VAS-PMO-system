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
