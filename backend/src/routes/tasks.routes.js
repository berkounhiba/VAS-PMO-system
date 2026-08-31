import { Router } from "express";
import {
  getTasksByAssignee,
  updateTaskStatus,
  getAllTasksFull,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller.js";

const router = Router();
router.get("/tasks", getTasksByAssignee);
router.get("/tasks/full", getAllTasksFull);
router.post("/tasks", createTask);
router.put("/tasks/:id/status", updateTaskStatus);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

export default router;
