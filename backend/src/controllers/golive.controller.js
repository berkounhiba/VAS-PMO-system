import { pool } from "../config/db.js";
export async function getGolive(req, res) {
  const result = await pool.query("SELECT * FROM golive");
  res.json(result.rows);
}