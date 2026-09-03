import { Router } from "express";
import {
  getGolive,
  createGolive,
  updateGolive,
  deleteGolive,
} from "../controllers/golive.controller.js";

const router = Router();
router.get("/golive", getGolive);
router.post("/golive", createGolive);
router.put("/golive/:id", updateGolive);
router.delete("/golive/:id", deleteGolive);

export default router;
