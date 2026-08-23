import { Router } from "express";
import { getAllProjects, getAllProjectsFull } from "../controllers/projects.controller.js";

const router = Router();
router.get("/projects", getAllProjects);
router.get("/projects/full", getAllProjectsFull);

export default router;