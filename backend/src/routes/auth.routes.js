import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
const router = Router();
router.post("/login", login);
router.get("/me", me);
export default router;
