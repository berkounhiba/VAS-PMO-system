import { Router } from "express";
import { getDependencies } from "../controllers/dependencies.controller.js";
const router = Router();
router.get("/dependencies", getDependencies);
export default router;
