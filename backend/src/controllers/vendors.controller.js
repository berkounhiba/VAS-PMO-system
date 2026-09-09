import { pool } from "../config/db.js";

export async function getVendors(req, res) {
  const result = await pool.query("SELECT * FROM vendors ORDER BY due_date");
  res.json(result.rows);
}

export async function createVendor(req, res) {
  // Accept BOTH camelCase (from old React) and snake_case (from new React)
  const vendorName = req.body.vendorName ?? req.body.vendor_name;
  const projectId  = req.body.projectId  ?? req.body.project_id  ?? null;
  const pendingAction = req.body.pendingAction ?? req.body.pending_action ?? null;
  const ownerId    = req.body.ownerId    ?? req.body.owner_id    ?? null;
  const sentDate   = req.body.sentDate   ?? req.body.sent_date   ?? null;
  const dueDate    = req.body.dueDate    ?? req.body.due_date    ?? null;
  const daysOpen   = req.body.daysOpen   ?? req.body.days_open   ?? 0;
  const status     = req.body.status     ?? "Open";

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
  "vendor_name", "project_id", "pending_action", "owner_id",
  "sent_date", "due_date", "days_open", "status",
];

export async function updateVendor(req, res) {
  const { id } = req.params;

  // Normalize camelCase → snake_case so either works
  const raw = req.body;
  const normalized = {};
  for (const [key, value] of Object.entries(raw)) {
    const snake = key.replace(/[A-Z]/g, (l) => "_" + l.toLowerCase());
    normalized[snake] = value;
  }

  const fieldsToUpdate = Object.keys(normalized).filter((k) =>
    VENDOR_EDITABLE_FIELDS.includes(k)
  );

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fieldsToUpdate
    .map((field, i) => `${field} = $${i + 1}`)
    .join(", ");
  const values = fieldsToUpdate.map((field) => normalized[field]);

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
