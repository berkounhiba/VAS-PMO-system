import { Router } from "express";
import { getMeetings } from "../controllers/meetings.controller.js";
const router = Router();
router.get("/meetings", getMeetings);
export default router;