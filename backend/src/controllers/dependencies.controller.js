import { pool } from "../config/db.js";

export async function getDependencies(req, res) {
  const result = await pool.query("SELECT * FROM dependencies ORDER BY target_date");
  res.json(result.rows);
}
