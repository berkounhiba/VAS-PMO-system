import { pool } from "../config/db.js";

export async function getDependencies(req, res) {
  const result = await pool.query("SELECT * FROM dependencies ORDER BY target_date");
  res.json(result.rows);
}

export async function createDependency(req, res) {
  const { projectId, dependsOn, critical, ownerId, status, targetDate } = req.body;

  if (!dependsOn) return res.status(400).json({ error: "dependsOn is required" });
  if (!projectId) return res.status(400).json({ error: "projectId is required" });

  const result = await pool.query(
    `INSERT INTO dependencies (project_id, depends_on, critical, owner_id, status, target_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [projectId, dependsOn, critical || "No", ownerId || null, status || "Open", targetDate || null]
  );

  res.status(201).json(result.rows[0]);
}

const DEPENDENCY_EDITABLE_FIELDS = [
  "project_id",
  "depends_on",
  "critical",
  "owner_id",
  "status",
  "target_date",
];

export async function updateDependency(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const fieldsToUpdate = Object.keys(updates).filter((k) => DEPENDENCY_EDITABLE_FIELDS.includes(k));

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fieldsToUpdate.map((field, i) => `${field} = $${i + 1}`).join(", ");
  const values = fieldsToUpdate.map((field) => updates[field]);

  const result = await pool.query(
    `UPDATE dependencies SET ${setClause} WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`,
    [...values, id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Dependency not found" });
  res.json(result.rows[0]);
}

export async function deleteDependency(req, res) {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM dependencies WHERE id = $1 RETURNING id", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Dependency not found" });
  res.json({ deleted: id });
}
