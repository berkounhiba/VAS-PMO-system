import { Router } from "express";
import { getUatSit } from "../controllers/uatsit.controller.js";
const router = Router();
router.get("/uat_sit", getUatSit);
export default router;
