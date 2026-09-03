// backend/src/routes/risks.routes.js
import { Router } from "express";
import {
  getAllRisks,
  createRisk,
  updateRisk,
  deleteRisk,
} from "../controllers/risks.controller.js";

const router = Router();
router.get("/risks", getAllRisks);
router.post("/risks", createRisk);
router.put("/risks/:id", updateRisk);
router.delete("/risks/:id", deleteRisk);

export default router;
