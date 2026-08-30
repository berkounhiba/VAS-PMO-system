import { pool } from "../config/db.js";

export async function getAllProjects(req, res) {
  const result = await pool.query("SELECT id, name FROM projects ORDER BY name");
  res.json(result.rows);
}

export async function getAllProjectsFull(req, res) {
  const result = await pool.query(`
    SELECT
      p.id, p.name, p.domain, p.business, u.name AS lead, p.lead_id AS "leadId",
      p.priority, p.status, p.phase, p.progress,
      p.planned_start AS "plannedStart", p.planned_go_live AS "plannedFinish",
      p.forecast_go_live AS "forecastFinish", p.delay_days AS "delayDays",
      p.health, p.blocker, p.next_action AS "nextAction", p.escalation, p.remarks,
      p.project_type AS "projectType"
    FROM projects p
    LEFT JOIN users u ON u.id = p.lead_id
    ORDER BY p.name
  `);
  res.json(result.rows);
}

export async function getITProjects(req, res) {
  const result = await pool.query(`
    SELECT p.id, p.name, p.status, p.health, p.progress,
           d.vendor, d.cycle_weeks AS "cycleWeeks", d.phase
    FROM projects p JOIN it_project_details d ON d.project_id = p.id ORDER BY p.name
  `);
  res.json(result.rows);
}

export async function getBusinessProjects(req, res) {
  const result = await pool.query(`
    SELECT p.id, p.name, p.status, p.health, p.progress,
           d.business_requester AS "businessRequester", d.phase
    FROM projects p JOIN business_project_details d ON d.project_id = p.id ORDER BY p.name
  `);
  res.json(result.rows);
}

export async function createProject(req, res) {
  const { name, domain, business, projectType, priority, status, phase, leadId } = req.body;
  if (!name) return res.status(400).json({ error: "Project name is required" });

  const result = await pool.query(
    `INSERT INTO projects (name, domain, business, project_type, priority, status, phase, lead_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, domain || null, business || null, projectType || null,
     priority || "Medium", status || "On Track", phase || null, leadId || null]
  );
  res.status(201).json(result.rows[0]);
}

const EDITABLE_FIELDS = [
  "name", "domain", "business", "priority", "status", "phase",
  "progress", "blocker", "next_action", "escalation", "remarks",
  "delay_days", "health", "planned_go_live", "forecast_go_live", "lead_id",
];

export async function updateProject(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const fieldsToUpdate = Object.keys(updates).filter((k) => EDITABLE_FIELDS.includes(k));
  if (fieldsToUpdate.length === 0) return res.status(400).json({ error: "No valid fields to update" });

  const setClause = fieldsToUpdate.map((field, i) => `${field} = $${i + 1}`).join(", ");
  const values = fieldsToUpdate.map((field) => updates[field]);
  const result = await pool.query(
    `UPDATE projects SET ${setClause} WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`,
    [...values, id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Project not found" });
  res.json(result.rows[0]);
}

export async function deleteProject(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Project not found" });
    res.json({ deleted: id });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ error: "Cannot delete — this project still has tasks, milestones, or risks linked to it. Remove those first." });
    }
    throw err;
  }
}