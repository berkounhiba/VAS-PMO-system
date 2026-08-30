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
 
// Verifies a token and returns the current user — used on app load
// to check "is this person already logged in" without asking again.
export async function me(req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query("SELECT id, name, role, access_level FROM users WHERE id = $1", [payload.id]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "User no longer exists" });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
 
