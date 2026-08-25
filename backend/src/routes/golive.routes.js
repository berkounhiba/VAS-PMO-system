import { Router } from "express";
import { getGolive } from "../controllers/golive.controller.js";
const router = Router();
router.get("/golive", getGolive);
export default router;
