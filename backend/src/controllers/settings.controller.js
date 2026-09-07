import { pool } from "../config/db.js";

export async function getSettings(req, res) {
  const result = await pool.query("SELECT key, value FROM app_settings");
  const settings = {};
  for (const row of result.rows) {
    settings[row.key] = Number(row.value);
  }
  res.json(settings);
}

const SETTINGS_KEYS = ["red_delay_days", "amber_delay_days", "overloaded_pct", "healthy_pct"];

export async function updateSettings(req, res) {
  const updates = req.body;
  const keysToUpdate = Object.keys(updates).filter((k) => SETTINGS_KEYS.includes(k));

  if (keysToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid settings to update" });
  }

  await Promise.all(
    keysToUpdate.map((key) =>
      pool.query(
        `INSERT INTO app_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, updates[key]]
      )
    )
  );

  const result = await pool.query("SELECT key, value FROM app_settings");
  const settings = {};
  for (const row of result.rows) {
    settings[row.key] = Number(row.value);
  }
  res.json(settings);
}
