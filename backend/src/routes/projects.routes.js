import { Router } from "express";
import { getAllProjects, getAllProjectsFull } from "../controllers/projects.controller.js";
import {  updateProject, createProject } from "../controllers/projects.controller.js";

const router = Router();
router.get("/projects", getAllProjects);
router.get("/projects/full", getAllProjectsFull);
router.post("/projects", createProject);
router.put("/projects/:id", updateProject); 

export default router;