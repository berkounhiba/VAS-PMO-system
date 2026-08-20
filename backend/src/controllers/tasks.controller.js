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