import express from "express";
import { createRFQ, getRFQs } from "../controllers/rfqController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken); // Protect all RFQ routes

router.post("/", authorizeRoles("BUYER"), createRFQ);
router.get("/", getRFQs);

export default router;