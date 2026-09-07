import { pool } from "../config/db.js";

function isManagerOrAdmin(req) {
  return req.user.access_level === "manager" || req.user.access_level === "admin";
}

// For the `projects` table itself — PUT/DELETE /projects/:id.
// Allowed if you're a manager/admin, or the project's assigned Lead.
export function requireProjectOwnerOrManager() {
  return async (req, res, next) => {
    if (isManagerOrAdmin(req)) return next();
    const result = await pool.query("SELECT lead_id FROM projects WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Project not found" });
    if (result.rows[0].lead_id === req.user.id) return next();
    return res.status(403).json({ error: "Only the project's lead or a manager can do this" });
  };
}

// For CREATING a task/milestone/risk/dependency/vendor/uat_sit/golive
// record inside a project — allowed if manager/admin, or the lead of
// that project. If no projectId is given at all (e.g. a task with no
// project), anyone logged in may create it — there's no project to
// gatekeep against.
//
// NOTE: `bodyField` is always a fixed string chosen in code below,
// never derived from user input — safe to use directly.
export function requireProjectLeadToCreate(bodyField = "projectId") {
  return async (req, res, next) => {
    if (isManagerOrAdmin(req)) return next();
    const projectId = req.body[bodyField];
    if (!projectId) return next();
    const result = await pool.query("SELECT lead_id FROM projects WHERE id = $1", [projectId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Project not found" });
    if (result.rows[0].lead_id === req.user.id) return next();
    return res.status(403).json({ error: "Only the project's lead or a manager can add items to it" });
  };
}

// For editing/deleting an EXISTING record that has its own owner or
// assignee column (tasks -> assignee_id, milestones/risks/dependencies/
// vendors -> owner_id). Allowed if manager/admin, OR you're the
// record's owner/assignee, OR you're the lead of its parent project.
//
// NOTE: `table` and `ownerColumn` are always fixed strings chosen in
// code below (see routes files), never derived from user input —
// interpolating them into SQL here is safe for that reason only.
export function requireRecordOwnerOrProjectLeadOrManager(table, ownerColumn) {
  return async (req, res, next) => {
    if (isManagerOrAdmin(req)) return next();
    const result = await pool.query(
      `SELECT t.${ownerColumn} AS owner_id, p.lead_id
       FROM ${table} t LEFT JOIN projects p ON p.id = t.project_id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Record not found" });
    const { owner_id, lead_id } = result.rows[0];
    if (owner_id === req.user.id || lead_id === req.user.id) return next();
    return res.status(403).json({ error: "Only the assigned owner, the project lead, or a manager can do this" });
  };
}

// For uat_sit/golive — these have no owner/assignee column at all,
// they belong to the project as a whole. Allowed if manager/admin,
// or the lead of the parent project.
export function requireProjectLeadOfRecordOrManager(table) {
  return async (req, res, next) => {
    if (isManagerOrAdmin(req)) return next();
    const result = await pool.query(
      `SELECT p.lead_id FROM ${table} t JOIN projects p ON p.id = t.project_id WHERE t.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Record not found" });
    if (result.rows[0].lead_id === req.user.id) return next();
    return res.status(403).json({ error: "Only the project's lead or a manager can do this" });
  };
}
