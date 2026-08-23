// backend/src/controllers/milestones.controller.js
import { pool } from "../config/db.js";

export async function getAllMilestones(req, res) {
  const result = await pool.query(`
    SELECT
      m.id,
      p.name AS project,
      m.title AS name,
      u.name AS owner,
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