import { Router } from "express";
import {
  getAllProjects,
  getAllProjectsFull,
  getITProjects,
  getBusinessProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projects.controller.js";
import { requireProjectOwnerOrManager } from "../middleware/ownership.middleware.js";

const router = Router();
router.get("/projects", getAllProjects);
router.get("/projects/full", getAllProjectsFull);
router.get("/projects/it", getITProjects);
router.get("/projects/business", getBusinessProjects);
router.post("/projects", createProject); // anyone logged in can create; becomes lead automatically
router.put("/projects/:id", requireProjectOwnerOrManager(), updateProject);
router.delete("/projects/:id", requireProjectOwnerOrManager(), deleteProject);

export default router;
