import { pool } from "../config/db.js";

export async function getAllProjects(req, res) {
  const result = await pool.query("SELECT id, name FROM projects ORDER BY name");
  res.json(result.rows);
}

export async function getAllProjectsFull(req, res) {
  const result = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.domain,
      p.business,
      u.name AS lead,
      p.priority,
      p.status,
      p.phase,
      p.progress,
      p.planned_start AS "plannedStart",
      p.planned_go_live AS "plannedFinish",
      p.forecast_go_live AS "forecastFinish",
      p.delay_days AS "delayDays",
      p.health,
      p.blocker,
      p.next_action AS "nextAction",
      p.escalation,
      p.remarks
    FROM projects p
    LEFT JOIN users u ON u.id = p.lead_id
    ORDER BY p.name
  `);
  res.json(result.rows);
}

export async function updateProject(req, res) {
  const { id } = req.params;
  const fields = req.body; // e.g. { status, health, phase, progress, blocker, next_action }
  const keys = Object.keys(fields);
  if (keys.length === 0) return res.status(400).json({ error: "No fields provided" });

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = keys.map((k) => fields[k]);
  values.push(id);

  const result = await pool.query(
    `UPDATE projects SET ${setClause} WHERE id = $${values.length} RETURNING *`,
    values
  );
  res.json(result.rows[0]);
}

export async function createProject(req, res) {
  const { name, domain, business, priority, project_type } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const result = await pool.query(
    `INSERT INTO projects (name, domain, business, priority, project_type)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, domain ?? null, business ?? null, priority ?? "Medium", project_type ?? "IT"]
  );
  res.status(201).json(result.rows[0]);
}