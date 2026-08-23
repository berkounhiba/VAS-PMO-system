// backend/src/routes/risks.routes.js
import { Router } from "express";
import { getAllRisks } from "../controllers/risks.controller.js";

const router = Router();
router.get("/risks", getAllRisks);

export default router;