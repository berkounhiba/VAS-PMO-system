// backend/src/controllers/risks.controller.js
import { pool } from "../config/db.js";

export async function getAllRisks(req, res) {
  const result = await pool.query(`
    SELECT
      r.id,
      p.name AS project,
      r.description AS risk,
      r.probability,
      r.impact,
      r.score,
      r.mitigation,
      u.name AS owner,
      r.status
    FROM risks r
    LEFT JOIN projects p ON p.id = r.project_id
    LEFT JOIN users u ON u.id = r.owner_id
    ORDER BY r.score DESC
  `);
  res.json(result.rows);
}
