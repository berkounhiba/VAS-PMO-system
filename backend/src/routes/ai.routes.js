import { Router } from "express";
import { chatWithAI } from "../controllers/ai.controller.js";

const router = Router();
router.post("/ai/chat", chatWithAI);

export default router;