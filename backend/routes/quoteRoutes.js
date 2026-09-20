import express from "express";
import { submitQuote, getQuotesByRFQ } from "../controllers/quoteController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken); // Protect all quote routes

router.post("/", authorizeRoles("SUPPLIER"), submitQuote);
router.get("/rfq/:rfqId", getQuotesByRFQ);

export default router;