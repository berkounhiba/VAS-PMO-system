import { pool } from "../config/db.js";
 
export async function getWeeklySummaries(req, res) {
  const result = await pool.query(`
    SELECT
      ws.id,
      ws.meeting_date AS "meetingDate",
      ws.summary,
      u.name AS "authorName",
      ws.author_id AS "authorId",
      ws.created_at AS "createdAt"
    FROM weekly_meeting_summaries ws
    LEFT JOIN users u ON u.id = ws.author_id
    ORDER BY ws.meeting_date DESC
  `);
  res.json(result.rows);
}
 
export async function createWeeklySummary(req, res) {
  const { meeting_date, summary, author_id } = req.body;
  if (!meeting_date || !summary || !author_id) {
    return res.status(400).json({ error: "meeting_date, summary, and author_id are required" });
  }
  const result = await pool.query(
    `INSERT INTO weekly_meeting_summaries (meeting_date, summary, author_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [meeting_date, summary, author_id]
  );
  res.status(201).json(result.rows[0]);
}
 
