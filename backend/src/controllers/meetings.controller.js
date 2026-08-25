import { pool } from "../config/db.js";
export async function getMeetings(req, res) {
  const result = await pool.query("SELECT * FROM meetings ORDER BY meeting_date DESC");
  res.json(result.rows);
}