import { Router } from "express";
import { getVendors, createVendor, updateVendor, deleteVendor } from "../controllers/vendors.controller.js";
import { requireProjectLeadToCreate, requireRecordOwnerOrProjectLeadOrManager } from "../middleware/ownership.middleware.js";

const router = Router();
router.get("/vendors", getVendors);
router.post("/vendors", requireProjectLeadToCreate("projectId"), createVendor);
router.put("/vendors/:id", requireRecordOwnerOrProjectLeadOrManager("vendors", "owner_id"), updateVendor);
router.delete("/vendors/:id", requireRecordOwnerOrProjectLeadOrManager("vendors", "owner_id"), deleteVendor);
export default router;
