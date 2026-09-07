import { Router } from "express";
import {
  getDependencies,
  createDependency,
  updateDependency,
  deleteDependency,
} from "../controllers/dependencies.controller.js";
import { requireProjectLeadToCreate, requireRecordOwnerOrProjectLeadOrManager } from "../middleware/ownership.middleware.js";

const router = Router();
router.get("/dependencies", getDependencies);
router.post("/dependencies", requireProjectLeadToCreate("projectId"), createDependency);
router.put("/dependencies/:id", requireRecordOwnerOrProjectLeadOrManager("dependencies", "owner_id"), updateDependency);
router.delete("/dependencies/:id", requireRecordOwnerOrProjectLeadOrManager("dependencies", "owner_id"), deleteDependency);

export default router;
