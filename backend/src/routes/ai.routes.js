import { Router } from "express";
import { chatWithAI, draftVendorEmail } from "../controllers/ai.controller.js";

const router = Router();
router.post("/ai/chat", chatWithAI);
router.post("/ai/draft-email", draftVendorEmail);


export default router;