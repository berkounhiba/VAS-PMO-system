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
      p.name AS project,
      u.name AS owner,
      t.status,
      t.due_date AS finish,
      t.created_at AS start
    FROM tasks t
    LEFT JOIN projects p ON p.id = t.project_id
    LEFT JOIN users u ON u.id = t.assignee_id
    ORDER BY t.due_date
  `);
  const shaped = result.rows.map((r) => ({
    ...r,
    priority: "Medium",
    progress: r.status === "Done" ? 1 : r.status === "In Progress" ? 0.5 : 0,
    dependency: "—",
    comments: "—",
  }));
  res.json(shaped);
}
