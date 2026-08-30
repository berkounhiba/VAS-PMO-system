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

const router = Router();
router.get("/projects", getAllProjects);
router.get("/projects/full", getAllProjectsFull);
router.get("/projects/it", getITProjects);
router.get("/projects/business", getBusinessProjects);
router.post("/projects", createProject);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

export default router;