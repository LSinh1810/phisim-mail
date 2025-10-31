import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import trackRoutes from "./routes/trackRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// email config check
app.get("/api/email-config", (req, res) => {
  res.json({
    GMAIL_USER: process.env.GMAIL_USER ? "***" + process.env.GMAIL_USER.slice(-4) : "Not set",
    GMAIL_FROM: process.env.GMAIL_FROM || "Not set",
    GMAIL_FROM_NAME: process.env.GMAIL_FROM_NAME || "Not set",
    BASE_URL: process.env.BASE_URL || "Not set"
  });
});

// Routes
app.use("/api/campaigns", campaignRoutes);
app.use("/api/track", trackRoutes);

// 404 handler
app.use(/.*/, (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message
  });
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server bắt đầu trên cổng ${PORT}`);
    });
});
