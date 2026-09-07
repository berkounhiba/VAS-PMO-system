// backend/src/controllers/users.controller.js
import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

export async function getAllUsers(req, res) {
  const result = await pool.query(
    `SELECT id, name, role, is_manager, access_level, skills, capacity_pct, allocated_pct, is_active
     FROM users ORDER BY is_active DESC, name`
  );
  res.json(result.rows);
}

export async function createUser(req, res) {
  const { name, role, accessLevel, skills, capacityPct, isManager, password } = req.body;

  if (!name) return res.status(400).json({ error: "Name is required" });
  if (!password) return res.status(400).json({ error: "Password is required" });

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, role, access_level, skills, capacity_pct, is_manager, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, role, is_manager, access_level, skills, capacity_pct, allocated_pct, is_active`,
    [
      name,
      role || "VAS Engineer",
      accessLevel || "engineer",
      skills || null,
      capacityPct ?? 1.0,
      isManager ?? false,
      passwordHash,
    ]
  );

  res.status(201).json(result.rows[0]);
}

const USER_EDITABLE_FIELDS = [
  "name",
  "role",
  "access_level",
  "skills",
  "capacity_pct",
  "is_manager",
  "is_active",
];

export async function updateUser(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const fieldsToUpdate = Object.keys(updates).filter((k) => USER_EDITABLE_FIELDS.includes(k));

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fieldsToUpdate.map((field, i) => `${field} = $${i + 1}`).join(", ");
  const values = fieldsToUpdate.map((field) => updates[field]);

  const result = await pool.query(
    `UPDATE users SET ${setClause} WHERE id = $${fieldsToUpdate.length + 1}
     RETURNING id, name, role, is_manager, access_level, skills, capacity_pct, allocated_pct, is_active`,
    [...values, id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
  res.json(result.rows[0]);
}

export async function resetUserPassword(req, res) {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).json({ error: "Password is required" });

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id",
    [passwordHash, id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
  res.json({ updated: id });
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ deleted: id });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({
        error: "Cannot delete — this user still has tasks, projects, or other records linked to them. Deactivate them instead, or reassign their work first.",
      });
    }
    throw err;
  }
}
