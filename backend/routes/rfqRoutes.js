import express from "express";
import { getRFQs, createRFQ, updateRFQ, deleteRFQ } from "../controllers/rfqController.js";
import { verifyToken, isBuyer } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Authenticated search & browse
router.get("/", verifyToken, getRFQs);

// Buyer-restricted actions
router.post("/", verifyToken, isBuyer, createRFQ);
router.put("/:id", verifyToken, isBuyer, updateRFQ);
router.delete("/:id", verifyToken, isBuyer, deleteRFQ);

export default router;