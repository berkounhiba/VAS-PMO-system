import { Router } from "express";
import {
  getAllMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "../controllers/milestones.controller.js";
import { requireProjectLeadToCreate, requireRecordOwnerOrProjectLeadOrManager } from "../middleware/ownership.middleware.js";

const router = Router();
router.get("/milestones", getAllMilestones);
router.post("/milestones", requireProjectLeadToCreate("projectId"), createMilestone);
router.put("/milestones/:id", requireRecordOwnerOrProjectLeadOrManager("milestones", "owner_id"), updateMilestone);
router.delete("/milestones/:id", requireRecordOwnerOrProjectLeadOrManager("milestones", "owner_id"), deleteMilestone);

export default router;
