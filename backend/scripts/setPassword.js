// ============================================================
// backend/scripts/setPassword.js  (NEW FILE)
//
// Sets (or resets) a login password for an EXISTING user — use
// this for Amir, Nesrine, and the rest of your 8 real team members.
// createAdmin.js is only for creating a brand-new account; this is
// for people already sitting in the users table.
//
// Run it yourself so the password never passes through chat:
//   node scripts/setPassword.js "Amir" "hisChosenPassword"
//
// Real long-term fix: build this into the Admin page UI so Admin
// can do it by clicking, not by running a script — worth doing
// once Sprint 3/4 settles, not urgent tonight.
// ============================================================
import bcrypt from "bcrypt";
import { pool } from "../src/config/db.js";

const [, , name, password] = process.argv;
if (!name || !password) {
  console.error('Usage: node scripts/setPassword.js "Name" "Password"');
  process.exit(1);
}

const existing = await pool.query("SELECT id FROM users WHERE name = $1", [name]);
if (existing.rows.length === 0) {
  console.error(`No user named "${name}" found — check spelling (case-sensitive).`);
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
await pool.query("UPDATE users SET password_hash = $1 WHERE name = $2", [hash, name]);
console.log(`Password set for ${name}. They can now log in.`);
process.exit(0);
