import { pool } from "../config/db.js";
export async function getKpis(req, res) {
  const result = await pool.query("SELECT * FROM kpis ORDER BY month");
  res.json(result.rows);
}
