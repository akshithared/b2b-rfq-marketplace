import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import { testDatabaseConnection } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import rfqRoutes from "./routes/rfqRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "B2B RFQ Marketplace API is running",
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/rfqs", rfqRoutes);
app.use("/api/quotes", quoteRoutes);

const startServer = async () => {
  try {
    await testDatabaseConnection();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed.");
    process.exit(1);
  }
};

startServer();