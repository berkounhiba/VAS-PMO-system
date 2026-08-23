// backend/src/routes/milestones.routes.js
import { Router } from "express";
import { getAllMilestones } from "../controllers/milestones.controller.js";

const router = Router();
router.get("/milestones", getAllMilestones);

export default router;
