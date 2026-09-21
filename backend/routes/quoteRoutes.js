import express from "express";
import { createQuote, getQuotesForRFQ } from "../controllers/quoteController.js";
import { verifyToken, isBuyer, isSupplier } from "../middleware/authMiddleware.js";

const router = express.Router();

// Supplier submits a quote
router.post("/", verifyToken, isSupplier, createQuote);

// Buyer views quotes for a specific RFQ
router.get("/rfq/:rfqId", verifyToken, isBuyer, getQuotesForRFQ);

export default router;