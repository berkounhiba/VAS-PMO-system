import { pool } from "../config/db.js";

export async function getAllMilestones(req, res) {
  const result = await pool.query(`
    SELECT
      m.id,
      m.project_id,
      p.name AS project,
      m.title AS name,
      u.name AS owner,
      m.owner_id,
      m.due_date AS planned,
      m.forecast_date AS forecast,
      m.status
    FROM milestones m
    LEFT JOIN projects p ON p.id = m.project_id
    LEFT JOIN users u ON u.id = m.owner_id
    ORDER BY m.due_date
  `);
  res.json(result.rows);
}

export async function createMilestone(req, res) {
  const { project_id, title, due_date, status, owner_id, forecast_date } = req.body;
  if (!project_id || !title) {
    return res.status(400).json({ error: "project_id and title are required" });
  }
  const result = await pool.query(
    `INSERT INTO milestones (project_id, title, due_date, status, owner_id, forecast_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [project_id, title, due_date ?? null, status ?? "Not Started", owner_id ?? null, forecast_date ?? null]
  );
  res.status(201).json(result.rows[0]);
}

export async function updateMilestone(req, res) {
  const { id } = req.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  if (keys.length === 0) return res.status(400).json({ error: "No fields provided" });

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = keys.map((k) => fields[k]);
  values.push(id);

  const result = await pool.query(
    `UPDATE milestones SET ${setClause} WHERE id = $${values.length} RETURNING *`,
    values
  );
  res.json(result.rows[0]);
}

export async function deleteMilestone(req, res) {
  const { id } = req.params;
  await pool.query("DELETE FROM milestones WHERE id = $1", [id]);
  res.status(204).send();
}