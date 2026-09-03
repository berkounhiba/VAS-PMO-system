import { Router } from "express";
import {
  getAllMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "../controllers/milestones.controller.js";

const router = Router();
router.get("/milestones", getAllMilestones);
router.post("/milestones", createMilestone);
router.put("/milestones/:id", updateMilestone);
router.delete("/milestones/:id", deleteMilestone);

export default router;