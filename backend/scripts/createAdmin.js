import bcrypt from "bcrypt";
import { pool } from "../src/config/db.js";
 
const [,, name, password] = process.argv;
if (!name || !password) {
  console.error("Usage: node scripts/createAdmin.js <name> <password>");
  process.exit(1);
}
 
const hash = await bcrypt.hash(password, 10);
await pool.query(
  "INSERT INTO users (name, role, password_hash, access_level) VALUES ($1, 'Admin', $2, 'admin')",
  [name, hash]
);
console.log(`Admin account created for ${name}. You can now log in.`);
process.exit(0);
