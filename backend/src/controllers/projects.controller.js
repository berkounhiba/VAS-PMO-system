import { pool } from "../config/db.js";

export async function getAllProjects(req, res) {
  const result = await pool.query("SELECT id, name FROM projects ORDER BY name");
  res.json(result.rows);
}

export async function getAllProjectsFull(req, res) {
  const result = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.domain,
      p.business,
      u.name AS lead,
      p.priority,
      p.status,
      p.phase,
      p.progress,
      p.planned_start AS "plannedStart",
      p.planned_go_live AS "plannedFinish",
      p.forecast_go_live AS "forecastFinish",
      p.delay_days AS "delayDays",
      p.health,
      p.blocker,
      p.next_action AS "nextAction",
      p.escalation,
      p.remarks
    FROM projects p
    LEFT JOIN users u ON u.id = p.lead_id
    ORDER BY p.name
  `);
  res.json(result.rows);
}