import express from "express";
import { createCampaign, getCampaigns, getCampaignById, deleteCampaign } from "../controllers/campaignController.js";

const router = express.Router();

// All routes are now public (no authentication/validation)
router.post("/", createCampaign);
router.get("/", getCampaigns);
router.get("/:id", getCampaignById);
router.delete("/:id", deleteCampaign);

export default router;