import { pool } from "../config/db.js";

export async function getTasksByAssignee(req, res) {
  const { assigneeId } = req.query;
  const result = await pool.query(
    "SELECT * FROM tasks WHERE assignee_id = $1 ORDER BY due_date",
    [assigneeId]
  );
  res.json(result.rows);
}

export async function updateTaskStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const result = await pool.query(
    "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  res.json(result.rows[0]);
}

export async function getAllTasksFull(req, res) {
  const result = await pool.query(`
    SELECT
      t.id,
      t.title AS task,
      t.project_id AS "projectId",
      p.name AS project,
      t.assignee_id AS "assigneeId",
      u.name AS owner,
      t.status,
      t.due_date AS finish,
      t.start_date AS start,
      t.created_at AS "createdAt",
      t.priority,
      t.progress,
      t.dependency,
      t.comments
    FROM tasks t
    LEFT JOIN projects p ON p.id = t.project_id
    LEFT JOIN users u ON u.id = t.assignee_id
    ORDER BY t.due_date
  `);
  res.json(result.rows);
}

export async function createTask(req, res) {
  const { title, projectId, assigneeId, status, dueDate, priority, startDate } = req.body;

  if (!title) return res.status(400).json({ error: "Task title is required" });

  const result = await pool.query(
    `INSERT INTO tasks (title, project_id, assignee_id, status, due_date, priority, start_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      title,
      projectId || null,
      assigneeId || null,
      status || "Not Started",
      dueDate || null,
      priority || "Medium",
      startDate || null,
    ]
  );

  res.status(201).json(result.rows[0]);
}

const TASK_EDITABLE_FIELDS = [
  "title",
  "project_id",
  "assignee_id",
  "status",
  "due_date",
  "priority",
  "start_date",
  "progress",
  "dependency",
  "comments",
];

export async function updateTask(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const fieldsToUpdate = Object.keys(updates).filter((k) => TASK_EDITABLE_FIELDS.includes(k));

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fieldsToUpdate.map((field, i) => `${field} = $${i + 1}`).join(", ");
  const values = fieldsToUpdate.map((field) => updates[field]);

  const result = await pool.query(
    `UPDATE tasks SET ${setClause} WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`,
    [...values, id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
  res.json(result.rows[0]);
}

export async function deleteTask(req, res) {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
  res.json({ deleted: id });
}
