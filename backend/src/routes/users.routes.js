// backend/src/routes/users.routes.js
import { Router } from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
} from "../controllers/users.controller.js";
import { requireRole } from "../middleware/auth.middleware.js";

const router = Router();
router.get("/users", getAllUsers); // any logged-in user (needed for assignee/owner dropdowns)
router.post("/users", requireRole(), createUser);
router.put("/users/:id", requireRole(), updateUser);
router.put("/users/:id/password", requireRole(), resetUserPassword);
router.delete("/users/:id", requireRole(), deleteUser);

export default router;
