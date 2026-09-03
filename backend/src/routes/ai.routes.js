import { Router } from "express";
import { chatWithAI,draftVendorEmail, generateWeeklyReport, summarizeMeetingMinutes } from "../controllers/ai.controller.js";

const router = Router();
router.post("/ai/chat", chatWithAI);
router.post("/ai/draft-email", draftVendorEmail);
router.post("/ai/weekly-report", generateWeeklyReport);
router.post("/ai/meeting-minutes", summarizeMeetingMinutes);

export default router;