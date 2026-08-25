import { pool } from "../config/db.js";
export async function getUatSit(req, res) {
  const result = await pool.query("SELECT * FROM uat_sit");
  res.json(result.rows);
}
