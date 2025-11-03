import express from "express";
import { createCampaign, getCampaigns, getCampaignById, deleteCampaign } from "../controllers/campaignController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Tất cả routes cần authentication trừ track routes
router.post("/", authenticate, createCampaign);
router.get("/", authenticate, getCampaigns);
router.get("/:id", authenticate, getCampaignById);
router.delete("/:id", authenticate, deleteCampaign);

export default router;