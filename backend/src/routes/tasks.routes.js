import { Router } from "express";
import { getTasksByAssignee, updateTaskStatus } from "../controllers/tasks.controller.js";

const router = Router();
router.get("/tasks", getTasksByAssignee);
router.put("/tasks/:id", updateTaskStatus);

export default router;