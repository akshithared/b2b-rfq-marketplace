import { query } from "../config/db.js";

// Submit a quote for an RFQ (Supplier only)
export const submitQuote = async (req, res) => {
  try {
    const { rfq_id, price, delivery_days, notes } = req.body;
    const supplierId = req.user.id;

    // 1. Check if RFQ exists and is OPEN
    const rfqCheck = await query(
      "SELECT id, status FROM rfqs WHERE id = $1",
      [rfq_id]
    );

    if (rfqCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found.",
      });
    }

    if (rfqCheck.rows[0].status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "Cannot submit quotes for closed or cancelled RFQs.",
      });
    }

    // 2. Insert quote into database
    const result = await query(
      `INSERT INTO quotes (rfq_id, supplier_id, price, delivery_days, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [rfq_id, supplierId, price, delivery_days, notes || null]
    );

    return res.status(201).json({
      success: true,
      message: "Quote submitted successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") { // Unique constraint violation (supplier already submitted)
      return res.status(409).json({
        success: false,
        message: "You have already submitted a quote for this RFQ.",
      });
    }

    console.error("Error submitting quote:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit quote.",
    });
  }
};

// Get quotes for a specific RFQ (Buyer can view all quotes for their RFQ; Supplier views their own)
export const getQuotesByRFQ = async (req, res) => {
  try {
    const { rfqId } = req.params;

    let result;
    if (req.user.role === "BUYER") {
      result = await query(
        `SELECT q.*, u.name as supplier_name, u.email as supplier_email
         FROM quotes q
         JOIN users u ON q.supplier_id = u.id
         JOIN rfqs r ON q.rfq_id = r.id
         WHERE q.rfq_id = $1 AND r.buyer_id = $2
         ORDER BY q.created_at DESC`,
        [rfqId, req.user.id]
      );
    } else {
      result = await query(
        `SELECT * FROM quotes WHERE rfq_id = $1 AND supplier_id = $2`,
        [rfqId, req.user.id]
      );
    }

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quotes.",
    });
  }
};