import { pool } from "../config/db.js";

export async function getMeetings(req, res) {
  const result = await pool.query(
    "SELECT * FROM meetings ORDER BY meeting_date DESC, meeting_time DESC"
  );
  res.json(result.rows);
}

export async function getAllMeetings(req, res) {
  const result = await pool.query(
    "SELECT * FROM meetings ORDER BY meeting_date DESC, meeting_time DESC"
  );
  res.json(result.rows);
}

export async function createMeeting(req, res) {
  // Accept BOTH camelCase (from React) and snake_case (direct API)
  const meetingDate = req.body.meetingDate ?? req.body.meeting_date ?? null;
  const meetingTime = req.body.meetingTime ?? req.body.meeting_time ?? null;
  const projectId   = req.body.projectId   ?? req.body.project_id   ?? null;
  const topic       = req.body.topic;
  const decision    = req.body.decision    ?? null;
  const action      = req.body.action      ?? null;
  const ownerId     = req.body.ownerId     ?? req.body.owner_id     ?? null;
  const dueDate     = req.body.dueDate     ?? req.body.due_date     ?? null;
  const status      = req.body.status      ?? "Planned";

  if (!topic) {
    return res.status(400).json({ error: "Meeting topic is required" });
  }

  const result = await pool.query(
    `INSERT INTO meetings
       (meeting_date, meeting_time, project_id, topic,
        decision, action, owner_id, due_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [meetingDate, meetingTime, projectId, topic,
     decision, action, ownerId, dueDate, status]
  );

  res.status(201).json(result.rows[0]);
}

// Add ANY extra DB columns here as they appear
const MEETING_EDITABLE_FIELDS = [
  "meeting_date",
  "meeting_time",
  "project_id",
  "topic",
  "decision",
  "action",
  "owner_id",
  "due_date",
  "status",
  // ← add more here, e.g. "location", "notes", "duration", etc.
];

export async function updateMeeting(req, res) {
  const { id } = req.params;

  // Normalize camelCase → snake_case so React forms work seamlessly
  const raw = req.body;
  const normalized = {};
  for (const [key, value] of Object.entries(raw)) {
    const snake = key.replace(/[A-Z]/g, (l) => "_" + l.toLowerCase());
    normalized[snake] = value;
  }

  const fieldsToUpdate = Object.keys(normalized).filter((k) =>
    MEETING_EDITABLE_FIELDS.includes(k)
  );

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fieldsToUpdate
    .map((field, i) => `${field} = $${i + 1}`)
    .join(", ");
  const values = fieldsToUpdate.map((field) => normalized[field]);

  const result = await pool.query(
    `UPDATE meetings SET ${setClause} WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`,
    [...values, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Meeting not found" });
  }
  res.json(result.rows[0]);
}

export async function deleteMeeting(req, res) {
  const { id } = req.params;
  const result = await pool.query(
    "DELETE FROM meetings WHERE id = $1 RETURNING id",
    [id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Meeting not found" });
  }
  res.json({ deleted: id });
}
