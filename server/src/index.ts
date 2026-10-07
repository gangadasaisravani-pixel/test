import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

import { initializeDatabase } from "./db";
import casesRouter from "./routes/cases";
import evidenceRouter from "./routes/evidence";
import analysisRouter from "./routes/analysis";
import packageRouter from "./routes/package";
import { errorHandler } from "./middleware/errorHandler";
import { isGeminiConfigured } from "./lib/gemini";

const app = express();
const PORT = process.env.PORT || 5000;
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static file hosting for uploaded evidence
app.use("/uploads", express.static(uploadDir));

// System Health & Engine Config Status
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ClaimProof AI Core Engine",
    geminiConfigured: isGeminiConfigured(),
    timestamp: new Date().toISOString(),
  });
});

// Update Gemini Key in-memory/session if user supplies one in UI
app.post("/api/config/gemini-key", (req, res) => {
  const { apiKey } = req.body;
  if (apiKey && typeof apiKey === "string" && apiKey.trim().length > 10) {
    process.env.GEMINI_API_KEY = apiKey.trim();
    return res.json({ success: true, message: "Gemini API key updated for current session." });
  }
  return res.status(400).json({ error: "Invalid API key format" });
});

// API Routes
app.use("/api/cases", casesRouter);
app.use("/api", evidenceRouter);
app.use("/api", analysisRouter);
app.use("/api", packageRouter);

// Global Error Handler
app.use(errorHandler);

// Start server and initialize database
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`⚖️  ClaimProof AI Backend running on port ${PORT}`);
      console.log(`🤖  Gemini AI Engine: ${isGeminiConfigured() ? "CONNECTED (Live SDK)" : "READY (Forensic Verification Mode)"}`);
      console.log(`📁  Upload Vault: ${uploadDir}`);
      console.log(`====================================================`);
    });
  } catch (err: any) {
    console.error("Failed to initialize server database:", err);
    process.exit(1);
  }
}

startServer();
