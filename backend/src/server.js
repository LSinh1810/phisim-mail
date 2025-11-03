import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import trackRoutes from "./routes/trackRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import { 
  setupHelmet,  
  xssCleanMiddleware, 
  createRateLimiter,
  apiRateLimiter 
} from "./middleware/security.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(setupHelmet());

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware - Áp dụng cho tất cả routes
app.use(xssCleanMiddleware);
app.use(createRateLimiter());

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
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", apiRateLimiter, campaignRoutes);
app.use("/api/stats", apiRateLimiter, statsRoutes);
app.use("/api/track", trackRoutes); // Track routes không cần rate limit (quan trọng cho tracking)

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
