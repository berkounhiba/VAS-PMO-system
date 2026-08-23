// backend/src/routes/users.routes.js
import { Router } from "express";
import { getAllUsers } from "../controllers/users.controller.js";

const router = Router();
router.get("/users", getAllUsers);

export default router;