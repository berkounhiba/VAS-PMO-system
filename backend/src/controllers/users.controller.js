// backend/src/controllers/users.controller.js
import { pool } from "../config/db.js";

export async function getAllUsers(req, res) {
  const result = await pool.query(
    "SELECT id, name, role, is_manager, access_level, skills, capacity_pct, allocated_pct FROM users ORDER BY name"
  );
  res.json(result.rows);
}