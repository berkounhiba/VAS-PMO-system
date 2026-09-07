import { pool } from "../config/db.js";

export async function getVendors(req, res) {
  const result = await pool.query("SELECT * FROM vendors ORDER BY due_date");
  res.json(result.rows);
}

export async function createVendor(req, res) {
  const { vendorName, projectId, pendingAction, ownerId, sentDate, dueDate, daysOpen, status } = req.body;

  if (!vendorName) return res.status(400).json({ error: "vendorName is required" });

  const result = await pool.query(
    `INSERT INTO vendors (vendor_name, project_id, pending_action, owner_id, sent_date, due_date, days_open, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      vendorName,
      projectId || null,
      pendingAction || null,
      ownerId || null,
      sentDate || null,
      dueDate || null,
      daysOpen ?? 0,
      status || "Open",
    ]
  );

  res.status(201).json(result.rows[0]);
}

const VENDOR_EDITABLE_FIELDS = [
  "vendor_name",
  "project_id",
  "pending_action",
  "owner_id",
  "sent_date",
  "due_date",
  "days_open",
  "status",
];

export async function updateVendor(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const fieldsToUpdate = Object.keys(updates).filter((k) => VENDOR_EDITABLE_FIELDS.includes(k));

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fieldsToUpdate.map((field, i) => `${field} = $${i + 1}`).join(", ");
  const values = fieldsToUpdate.map((field) => updates[field]);

  const result = await pool.query(
    `UPDATE vendors SET ${setClause} WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`,
    [...values, id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Vendor record not found" });
  res.json(result.rows[0]);
}

export async function deleteVendor(req, res) {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM vendors WHERE id = $1 RETURNING id", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Vendor record not found" });
  res.json({ deleted: id });
}
