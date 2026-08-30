/* ============================================================
   WEEKLY MEETING ROTATION
   Every team member takes a turn writing the Tuesday meeting
   summary. Whose turn it is is computed, not stored — deterministic
   from the ISO week number, so everyone's app agrees without a
   database row saying "assigned to X" that could go stale.
============================================================= */

export function getTuesdayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, 2=Tue...
  const diff = 2 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// users: real user list from the DB. Returns the user whose turn it
// is this week, sorted alphabetically by name for a stable order
// everyone computes the same way.
export function getSummaryTurn(users, date = new Date()) {
  if (!users || users.length === 0) return null;
  const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));
  const week = getISOWeekNumber(date);
  return sorted[week % sorted.length];
}
