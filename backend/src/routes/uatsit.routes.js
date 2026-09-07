import { Router } from "express";
import {
  getUatSit,
  createUatSit,
  updateUatSit,
  deleteUatSit,
} from "../controllers/uatsit.controller.js";
import { requireProjectLeadToCreate, requireProjectLeadOfRecordOrManager } from "../middleware/ownership.middleware.js";

const router = Router();
router.get("/uat_sit", getUatSit);
router.post("/uat_sit", requireProjectLeadToCreate("projectId"), createUatSit);
router.put("/uat_sit/:id", requireProjectLeadOfRecordOrManager("uat_sit"), updateUatSit);
router.delete("/uat_sit/:id", requireProjectLeadOfRecordOrManager("uat_sit"), deleteUatSit);

export default router;
