import { Router } from "express";
import {
  getTasksByAssignee,
  updateTaskStatus,
  getAllTasksFull,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller.js";
import { requireProjectLeadToCreate, requireRecordOwnerOrProjectLeadOrManager } from "../middleware/ownership.middleware.js";

const router = Router();
router.get("/tasks", getTasksByAssignee);
router.get("/tasks/full", getAllTasksFull);
// projectId is optional (tasks can exist with no project) — the
// middleware only gatekeeps when a projectId is actually supplied.
router.post("/tasks", requireProjectLeadToCreate("projectId"), createTask);
router.put("/tasks/:id/status", requireRecordOwnerOrProjectLeadOrManager("tasks", "assignee_id"), updateTaskStatus);
router.put("/tasks/:id", requireRecordOwnerOrProjectLeadOrManager("tasks", "assignee_id"), updateTask);
router.delete("/tasks/:id", requireRecordOwnerOrProjectLeadOrManager("tasks", "assignee_id"), deleteTask);

export default router;
