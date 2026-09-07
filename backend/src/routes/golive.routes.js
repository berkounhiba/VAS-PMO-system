import { Router } from "express";
import {
  getGolive,
  createGolive,
  updateGolive,
  deleteGolive,
} from "../controllers/golive.controller.js";
import { requireProjectLeadToCreate, requireProjectLeadOfRecordOrManager } from "../middleware/ownership.middleware.js";

const router = Router();
router.get("/golive", getGolive);
router.post("/golive", requireProjectLeadToCreate("projectId"), createGolive);
router.put("/golive/:id", requireProjectLeadOfRecordOrManager("golive"), updateGolive);
router.delete("/golive/:id", requireProjectLeadOfRecordOrManager("golive"), deleteGolive);

export default router;
