import { Router } from "express";
import { getWeeklySummaries, createWeeklySummary } from "../controllers/weeklySummaries.controller.js";
const router = Router();
router.get("/weekly-summaries", getWeeklySummaries);
router.post("/weekly-summaries", createWeeklySummary);
export default router;
