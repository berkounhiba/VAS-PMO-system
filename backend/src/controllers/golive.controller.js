import { pool } from "../config/db.js";

export async function getGolive(req, res) {
  const result = await pool.query("SELECT * FROM golive");
  res.json(result.rows);
}

export async function createGolive(req, res) {
  const { projectId, rfc, mop, rollback, monitoring, businessSignoff, technicalSignoff, ready } = req.body;

  if (!projectId) return res.status(400).json({ error: "projectId is required" });

  const result = await pool.query(
    `INSERT INTO golive (project_id, rfc, mop, rollback, monitoring, business_signoff, technical_signoff, ready)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      projectId,
      rfc || null,
      mop || null,
      rollback || null,
      monitoring || null,
      businessSignoff || null,
      technicalSignoff || null,
      ready || "No",
    ]
  );

  res.status(201).json(result.rows[0]);
}

const GOLIVE_EDITABLE_FIELDS = [
  "project_id",
  "rfc",
  "mop",
  "rollback",
  "monitoring",
  "business_signoff",
  "technical_signoff",
  "ready",
];

export async function updateGolive(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const fieldsToUpdate = Object.keys(updates).filter((k) => GOLIVE_EDITABLE_FIELDS.includes(k));

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fieldsToUpdate.map((field, i) => `${field} = $${i + 1}`).join(", ");
  const values = fieldsToUpdate.map((field) => updates[field]);

  const result = await pool.query(
    `UPDATE golive SET ${setClause} WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`,
    [...values, id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Go-Live record not found" });
  res.json(result.rows[0]);
}

export async function deleteGolive(req, res) {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM golive WHERE id = $1 RETURNING id", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Go-Live record not found" });
  res.json({ deleted: id });
}
