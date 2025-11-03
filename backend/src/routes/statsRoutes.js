import express from "express";
import { getDashboardStats } from "../controllers/statsController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getDashboardStats);

export default router;

