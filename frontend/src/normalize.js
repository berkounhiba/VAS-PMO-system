/* ============================================================
   NORMALIZATION
   Adapts real DB rows (snake_case, ID-keyed) into the shape the
   UI components expect (name-keyed, like the original sample
   data). All field names below now match the REAL live schema
   exactly — see fill_from_excel.sql for the source of truth.
============================================================= */

export function buildLookups(projects, users) {
  const projectNameById = new Map(projects.map((p) => [p.id, p.name]));
  const userNameById = new Map(users.map((u) => [u.id, u.name]));
  return { projectNameById, userNameById };
}

export function normalizeProject(p, { userNameById } = {}) {
  return {
    id: p.id,
    name: p.name,
    domain: p.domain ?? "—",
    business: p.business ?? "—",
    lead: (userNameById && userNameById.get(p.lead_id)) ?? "Unassigned",
    track: (p.project_type || "IT").toLowerCase(), // 'it' | 'business'
    priority: p.priority ?? "Medium",
    status: p.status ?? "On Track",
    phase: p.phase ?? "—",
    progress: p.progress !== null && p.progress !== undefined ? Number(p.progress) : null,
    plannedStart: p.planned_start ?? null,
    plannedFinish: p.planned_go_live ?? null,
    forecastFinish: p.forecast_go_live ?? null,
    delayDays: p.delay_days ?? 0,
    health: p.health ?? "Green",
    blocker: p.blocker ?? "",
    nextAction: p.next_action ?? "—",
    escalation: p.escalation ?? "No",
    remarks: p.remarks ?? "",
  };
}

export function normalizeTask(t, { projectNameById, userNameById }) {
  return {
    id: t.id,
    project: projectNameById.get(t.project_id) ?? "Unknown project",
    task: t.title ?? "Untitled task",
    owner: userNameById.get(t.assignee_id) ?? "Unassigned",
    priority: t.priority ?? "Medium",
    status: t.status ?? "Not Started",
    start: t.start_date ?? null,
    finish: t.due_date ?? null,
    progress: t.progress !== null && t.progress !== undefined ? Number(t.progress) : 0,
    dependency: t.dependency ?? "",
    comments: t.comments ?? "",
  };
}

export function normalizeMilestone(m, { projectNameById, userNameById }) {
  return {
    project: projectNameById.get(m.project_id) ?? "Unknown project",
    name: m.title ?? "Untitled milestone",
    owner: userNameById.get(m.owner_id) ?? "Unassigned",
    planned: m.due_date ?? null,
    forecast: m.forecast_date ?? null,
    status: m.status ?? "Not Started",
  };
}

export function normalizeRisk(r, { projectNameById, userNameById }) {
  return {
    id: r.id,
    project: projectNameById.get(r.project_id) ?? "Unknown project",
    risk: r.description ?? "Untitled risk",
    probability: r.probability ?? "—",
    impact: r.impact ?? "—",
    score: r.score ?? 0,
    mitigation: r.mitigation ?? "—",
    owner: userNameById.get(r.owner_id) ?? "Unassigned",
    status: r.status ?? "Open",
  };
}

export function normalizeDependency(d, { projectNameById, userNameById }) {
  return {
    project: projectNameById.get(d.project_id) ?? "Unknown project",
    dependsOn: d.depends_on ?? "—",
    critical: d.critical === "Yes",
    owner: userNameById.get(d.owner_id) ?? "Unassigned",
    status: d.status ?? "—",
    target: d.target_date ?? null,
  };
}

export function normalizeUatSit(u, { projectNameById }) {
  return {
    project: projectNameById.get(u.project_id) ?? "Unknown project",
    module: u.module ?? "—",
    sit: u.sit_pct !== null && u.sit_pct !== undefined ? Number(u.sit_pct) : 0,
    uat: u.uat_pct !== null && u.uat_pct !== undefined ? Number(u.uat_pct) : 0,
    openDefects: u.open_defects ?? 0,
    criticalDefects: u.critical_defects ?? 0,
    ready: u.ready === "Yes",
  };
}

export function normalizeGolive(g, { projectNameById }) {
  return {
    project: projectNameById.get(g.project_id) ?? "Unknown project",
    rfc: g.rfc ?? "—",
    mop: g.mop ?? "—",
    rollback: g.rollback ?? "—",
    monitoring: g.monitoring ?? "—",
    businessSignoff: g.business_signoff ?? "—",
    techSignoff: g.technical_signoff ?? "—",
    ready: g.ready === "Yes",
  };
}

export function normalizeVendor(v, { projectNameById, userNameById }) {
  return {
    vendor: v.vendor_name ?? "—",
    project: projectNameById.get(v.project_id) ?? "Unknown project",
    action: v.pending_action ?? "—",
    owner: userNameById.get(v.owner_id) ?? "Unassigned",
    sent: v.sent_date ?? null,
    due: v.due_date ?? null,
    daysOpen: v.days_open ?? 0,
    status: v.status ?? "—",
  };
}

export function normalizeMeeting(m, { projectNameById, userNameById }) {
  return {
    date: m.meeting_date ?? null,
    project: m.project_id ? (projectNameById.get(m.project_id) ?? "Unknown project") : "Portfolio",
    topic: m.topic ?? "—",
    decision: m.decision ?? "—",
    action: m.action ?? "—",
    owner: userNameById.get(m.owner_id) ?? "Unassigned",
    due: m.due_date ?? null,
    status: m.status ?? "—",
  };
}

export function normalizeKpi(k) {
  return {
    month: k.month,
    OTD: k.otd_pct !== null ? Math.round(Number(k.otd_pct) * 100) : null,
    delay: k.avg_delay !== null ? Number(k.avg_delay) : null,
    FTR: k.ftr_pct !== null ? Math.round(Number(k.ftr_pct) * 100) : null,
    UAT: k.uat_pass_pct !== null ? Math.round(Number(k.uat_pass_pct) * 100) : null,
    SLA: k.vendor_sla_pct !== null ? Math.round(Number(k.vendor_sla_pct) * 100) : null,
  };
}
