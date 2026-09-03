// backend/src/controllers/risks.controller.js
import { pool } from "../config/db.js";

export async function getAllRisks(req, res) {
  const result = await pool.query(`
    SELECT
      r.id,
      r.project_id AS "projectId",
      p.name AS project,
      r.description AS risk,
      r.severity,
      r.probability,
      r.impact,
      r.score,
      r.mitigation,
      r.owner_id AS "ownerId",
      u.name AS owner,
      r.status
    FROM risks r
    LEFT JOIN projects p ON p.id = r.project_id
    LEFT JOIN users u ON u.id = r.owner_id
    ORDER BY r.score DESC
  `);
  res.json(result.rows);
}

export async function createRisk(req, res) {
  const { projectId, description, severity, probability, impact, score, mitigation, ownerId, status } = req.body;

  if (!description) return res.status(400).json({ error: "Risk description is required" });
  if (!projectId) return res.status(400).json({ error: "projectId is required" });

  const result = await pool.query(
    `INSERT INTO risks (project_id, description, severity, status, probability, impact, score, mitigation, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      projectId,
      description,
      severity || "Medium",
      status || "Open",
      probability || null,
      impact || null,
      score || null,
      mitigation || null,
      ownerId || null,
    ]
  );

  res.status(201).json(result.rows[0]);
}

const RISK_EDITABLE_FIELDS = [
  "project_id",
  "description",
  "severity",
  "status",
  "probability",
  "impact",
  "score",
  "mitigation",
  "owner_id",
];

export async function updateRisk(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const fieldsToUpdate = Object.keys(updates).filter((k) => RISK_EDITABLE_FIELDS.includes(k));

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fieldsToUpdate.map((field, i) => `${field} = $${i + 1}`).join(", ");
  const values = fieldsToUpdate.map((field) => updates[field]);

  const result = await pool.query(
    `UPDATE risks SET ${setClause} WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`,
    [...values, id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Risk not found" });
  res.json(result.rows[0]);
}

export async function deleteRisk(req, res) {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM risks WHERE id = $1 RETURNING id", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Risk not found" });
  res.json({ deleted: id });
}
