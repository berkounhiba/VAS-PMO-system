/* ============================================================
   ROLES — 3-role model (replaces the old 5-role demo matrix)

   admin    — manages users/team members, full access to everything
   manager  — assigns projects to engineers, adds/edits projects,
              manages tasks/milestones/risks across the portfolio
   engineer — sees and updates only what they're assigned to
============================================================= */
export const ROLES = {
  admin: {
    label: "Administrator",
    perms: ["*"],
  },
  manager: {
    label: "Manager",
    perms: [
      "view_portfolio", "view_kpi", "view_risk",
      "manage_projects", "assign_projects",
      "manage_tasks", "manage_milestones", "manage_risk",
      "resolve_conflict", "generate_reports",
    ],
  },
  engineer: {
    label: "Engineer",
    perms: ["view_assigned", "update_tasks"],
  },
};

export function hasPerm(role, perm) {
  const r = ROLES[role];
  if (!r) return false;
  return r.perms.includes("*") || r.perms.includes(perm);
}

/* ============================================================
   PROJECT TRACKS — projects follow one of two phase pipelines
   depending on which team owns them. Business-track projects
   start from specs/plan handed off by the business side;
   IT-track projects run the full technical delivery pipeline.

   NOTE: this needs a `track` column on the projects table
   ('business' | 'it') to work against real data — see the
   ALTER TABLE note in the updated instructions doc. Until that
   column exists, everything defaults to the 'it' pipeline.
============================================================= */
export const PHASE_PIPELINES = {
  business: ["Feasibility", "Dev", "SIT", "UAT", "GoLive"],
  it: ["Kickoff", "Plan", "Execution", "Integration", "Dev", "SUT", "UAT", "GoLive"],
};

export function phasesForTrack(track) {
  return PHASE_PIPELINES[track] || PHASE_PIPELINES.it;
}
