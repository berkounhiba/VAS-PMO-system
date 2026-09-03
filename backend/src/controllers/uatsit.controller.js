import { pool } from "../config/db.js";

export async function getUatSit(req, res) {
  const result = await pool.query("SELECT * FROM uat_sit");
  res.json(result.rows);
}

export async function createUatSit(req, res) {
  const { projectId, module, sitPct, uatPct, openDefects, criticalDefects, ready } = req.body;

  if (!module) return res.status(400).json({ error: "module is required" });
  if (!projectId) return res.status(400).json({ error: "projectId is required" });

  const result = await pool.query(
    `INSERT INTO uat_sit (project_id, module, sit_pct, uat_pct, open_defects, critical_defects, ready)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      projectId,
      module,
      sitPct ?? 0,
      uatPct ?? 0,
      openDefects ?? 0,
      criticalDefects ?? 0,
      ready || "No",
    ]
  );

  res.status(201).json(result.rows[0]);
}

const UATSIT_EDITABLE_FIELDS = [
  "project_id",
  "module",
  "sit_pct",
  "uat_pct",
  "open_defects",
  "critical_defects",
  "ready",
];

export async function updateUatSit(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const fieldsToUpdate = Object.keys(updates).filter((k) => UATSIT_EDITABLE_FIELDS.includes(k));

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fieldsToUpdate.map((field, i) => `${field} = $${i + 1}`).join(", ");
  const values = fieldsToUpdate.map((field) => updates[field]);

  const result = await pool.query(
    `UPDATE uat_sit SET ${setClause} WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`,
    [...values, id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "SIT/UAT record not found" });
  res.json(result.rows[0]);
}

export async function deleteUatSit(req, res) {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM uat_sit WHERE id = $1 RETURNING id", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "SIT/UAT record not found" });
  res.json({ deleted: id });
}
