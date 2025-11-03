import express from "express";
import { login, verify } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { loginRateLimiter } from "../middleware/security.js";

const router = express.Router();

router.post("/login", loginRateLimiter, login);
router.get("/verify", authenticate, verify);

export default router;

