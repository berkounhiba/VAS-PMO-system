import { pool } from "../config/db.js";
export async function getVendors(req, res) {
  const result = await pool.query("SELECT * FROM vendors ORDER BY due_date");
  res.json(result.rows);
}