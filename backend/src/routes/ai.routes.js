import { Router } from "express";
import { chatWithAI,draftVendorEmail, generateWeeklyReport, summarizeMeetingMinutes } from "../controllers/ai.controller.js";

const router = Router();
router.post("/ai/chat", chatWithAI);
router.post("/ai/draft-vendor-email", draftVendorEmail);
router.post("/ai/generate-weekly-report", generateWeeklyReport);
router.post("/ai/summarize-meeting-minutes", summarizeMeetingMinutes);

export default router;