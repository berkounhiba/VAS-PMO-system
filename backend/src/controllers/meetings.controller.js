import { pool } from "../config/db.js";

export async function getMeetings(req, res) {
  const result = await pool.query("SELECT * FROM meetings ORDER BY meeting_date DESC");
  res.json(result.rows);
}

export async function getAllMeetings(req, res) {
  const result = await pool.query("SELECT * FROM meetings ORDER BY meeting_date DESC");
  res.json(result.rows);
}

export async function createMeeting(req, res) {
  const { meetingDate, projectId, topic, decision, action, ownerId, dueDate, status } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Meeting topic is required" });
  }

  const result = await pool.query(
    `INSERT INTO meetings (meeting_date, project_id, topic, decision, action, owner_id, due_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [meetingDate || null, projectId || null, topic, decision || null,
     action || null, ownerId || null, dueDate || null, status || "Planned"]
  );

  res.status(201).json(result.rows[0]);
}
export async function deleteMeeting(req, res) {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM meetings WHERE id = $1 RETURNING id", [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Meeting not found" });
  }
  res.json({ deleted: id });
}
 