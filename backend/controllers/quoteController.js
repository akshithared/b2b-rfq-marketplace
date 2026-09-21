import { pool } from "../config/db.js";

// Submit a new quotation (Supplier only)
export const createQuote = async (req, res) => {
  try {
    // Diagnostic check for auth middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: User session missing." });
    }

    const { rfq_id, price, delivery_days, notes } = req.body;
    const supplier_id = req.user.id;

    const { rows } = await pool.query(
      `INSERT INTO quotes (rfq_id, supplier_id, price, delivery_days, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [rfq_id, supplier_id, price, delivery_days, notes]
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("DETAILED ERROR creating quote:", error.message, error.detail || "");
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Server error creating quote" 
    });
  }
};

// Fetch quotes submitted by the currently logged-in supplier
export const getSupplierQuotes = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: User session missing." });
    }

    const supplier_id = req.user.id;
    const { rows } = await pool.query(
      `SELECT q.*, r.title as rfq_title, r.delivery_location, r.deadline 
       FROM quotes q 
       JOIN rfqs r ON q.rfq_id = r.id 
       WHERE q.supplier_id = $1 
       ORDER BY q.created_at DESC`,
      [supplier_id]
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching supplier quotes:", error.message);
    return res.status(500).json({ success: false, message: "Server error fetching supplier quotes" });
  }
};

// Fetch quotes received for a specific buyer's RFQ
export const getQuotesForRFQ = async (req, res) => {
  try {
    const { rfqId } = req.params;
    
    const { rows } = await pool.query(
      `SELECT q.*, u.email as supplier_email, u.name as supplier_name 
       FROM quotes q
       LEFT JOIN users u ON q.supplier_id = u.id
       WHERE q.rfq_id = $1
       ORDER BY q.created_at DESC`,
      [rfqId]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching quotes for RFQ:", error.message);
    return res.status(500).json({ success: false, message: "Server error fetching quotes" });
  }
};