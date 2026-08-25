import { Router } from "express";
import { getVendors } from "../controllers/vendors.controller.js";
const router = Router();
router.get("/vendors", getVendors);
export default router;
