import { Router } from "express";
import { getMeetings,getAllMeetings, createMeeting, deleteMeeting } from "../controllers/meetings.controller.js";
const router = Router();
router.get("/meetings", getMeetings);
router.get("/all-meetings", getAllMeetings);
router.post("/meetings", createMeeting);
router.delete("/meetings/:id", deleteMeeting);
export default router;