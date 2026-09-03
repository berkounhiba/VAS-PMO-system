import { Router } from "express";
import {
  getUatSit,
  createUatSit,
  updateUatSit,
  deleteUatSit,
} from "../controllers/uatsit.controller.js";

const router = Router();
router.get("/uat_sit", getUatSit);
router.post("/uat_sit", createUatSit);
router.put("/uat_sit/:id", updateUatSit);
router.delete("/uat_sit/:id", deleteUatSit);

export default router;
