import jwt from "jsonwebtoken";

import { pool } from "../config/db.js"; // ADD THIS IMPORT

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);

    // NEW: verify the account wasn't deactivated since token was issued
    const check = await pool.query("SELECT is_active FROM users WHERE id = $1", [req.user.id]);
    if (!check.rows[0]?.is_active) {
      return res.status(403).json({ error: "Account deactivated" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}
// Verifies the Bearer token on every request it's applied to. Sets
// req.user = { id, name, access_level } from the token payload.
// Without this, NOTHING stops a request that has no login at all.
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

// requireRole() with no args = admin-only.
// requireRole("manager") = manager or admin.
// Admin can always pass, regardless of what's listed.
export function requireRole(...allowed) {
  return (req, res, next) => {
    if (req.user.access_level === "admin" || allowed.includes(req.user.access_level)) {
      return next();
    }
    return res.status(403).json({ error: "You don't have permission to do this" });
  };
}
