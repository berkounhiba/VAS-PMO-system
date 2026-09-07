import { Router } from "express";
import {
  getAllRisks,
  createRisk,
  updateRisk,
  deleteRisk,
} from "../controllers/risks.controller.js";
import { requireProjectLeadToCreate, requireRecordOwnerOrProjectLeadOrManager } from "../middleware/ownership.middleware.js";

const router = Router();
router.get("/risks", getAllRisks);
router.post("/risks", requireProjectLeadToCreate("projectId"), createRisk);
router.put("/risks/:id", requireRecordOwnerOrProjectLeadOrManager("risks", "owner_id"), updateRisk);
router.delete("/risks/:id", requireRecordOwnerOrProjectLeadOrManager("risks", "owner_id"), deleteRisk);

export default router;
