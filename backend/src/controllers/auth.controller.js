import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
 
export async function login(req, res) {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "name and password are required" });
  }
 
  const result = await pool.query("SELECT * FROM users WHERE name = $1", [name]);
  const user = result.rows[0];
 
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: "Invalid name or password" });
  }

  if (user.is_active === false) {
    return res.status(403).json({ error: "This account has been deactivated." });
  }
 
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid name or password" });
  }
 
  const token = jwt.sign(
    { id: user.id, name: user.name, access_level: user.access_level },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
 
  res.json({
    token,
    user: { id: user.id, name: user.name, role: user.role, access_level: user.access_level },
  });
}
 
// requireAuth middleware already verified the token and set req.user
// before this runs — no need to re-verify it here. This just fetches
// the freshest profile (in case name/role/access_level/is_active
// changed since the token was issued).
export async function me(req, res) {
  const result = await pool.query(
    "SELECT id, name, role, access_level, is_active FROM users WHERE id = $1",
    [req.user.id]
  );
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "User no longer exists" });
  if (user.is_active === false) return res.status(403).json({ error: "This account has been deactivated." });
  res.json({ user });
}
