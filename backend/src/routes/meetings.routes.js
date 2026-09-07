import { Router } from "express";
import { getMeetings, getAllMeetings, createMeeting, updateMeeting, deleteMeeting } from "../controllers/meetings.controller.js";
import { requireProjectLeadToCreate, requireRecordOwnerOrProjectLeadOrManager } from "../middleware/ownership.middleware.js";

const router = Router();
router.get("/meetings", getMeetings);
router.get("/all-meetings", getAllMeetings);
// projectId is optional — a meeting with no project is a "Portfolio"
// meeting anyone can create; one tied to a project requires being
// that project's lead (or manager/admin).
router.post("/meetings", requireProjectLeadToCreate("projectId"), createMeeting);
router.put("/meetings/:id", requireRecordOwnerOrProjectLeadOrManager("meetings", "owner_id"), updateMeeting);
router.delete("/meetings/:id", requireRecordOwnerOrProjectLeadOrManager("meetings", "owner_id"), deleteMeeting);
export default router;
