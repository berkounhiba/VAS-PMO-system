import { Router } from "express";
import { getTasksByAssignee, updateTaskStatus, getAllTasksFull } from "../controllers/tasks.controller.js";

const router = Router();
router.get("/tasks", getTasksByAssignee);
router.put("/tasks/:id", updateTaskStatus);
router.get("/tasks/full", getAllTasksFull);

export default router;
