import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import rfqRoutes from "./routes/rfqRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import { pool } from "./config/db.js";

dotenv.config();

const app = express();

// Middleware - origin: true automatically matches whichever port your frontend is on (5173, 5174, etc.)
app.use(cors({
  origin: true, 
  credentials: true
}));

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/rfqs", rfqRoutes);
app.use("/api/quotes", quoteRoutes);

// Healthcheck Route
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", database: "Connected" });
  } catch (err) {
    res.status(500).json({ status: "Error", database: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running smoothly on http://localhost:${PORT}`);
});