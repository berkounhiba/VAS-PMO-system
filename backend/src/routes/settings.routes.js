import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { requireRole } from "../middleware/auth.middleware.js";

const router = Router();
router.get("/settings", getSettings); // any logged-in user (needed for health calculations)
router.put("/settings", requireRole(), updateSettings);

export default router;
