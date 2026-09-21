import { pool } from "../config/db.js";

// Fetch all RFQs (with optional search filter)
export const getRFQs = async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM rfqs";
    let queryParams = [];

    if (search) {
      query += " WHERE title ILIKE $1 OR description ILIKE $1";
      queryParams.push(`%${search}%`);
    }

    query += " ORDER BY created_at DESC";

    const { rows } = await pool.query(query, queryParams);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching RFQs:", error);
    res.status(500).json({ success: false, message: "Server error fetching RFQs" });
  }
};

// Create a new RFQ (Buyer only)
export const createRFQ = async (req, res) => {
  const { title, description, quantity, delivery_location, deadline } = req.body;
  const buyer_id = req.user.id;

  try {
    const { rows } = await pool.query(
      `INSERT INTO rfqs (buyer_id, title, description, quantity, delivery_location, deadline)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [buyer_id, title, description, quantity, delivery_location, deadline]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error creating RFQ:", error);
    res.status(500).json({ success: false, message: "Server error creating RFQ" });
  }
};

// Update an RFQ
export const updateRFQ = async (req, res) => {
  const { id } = req.params;
  const { title, description, quantity, delivery_location, deadline } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE rfqs 
       SET title = $1, description = $2, quantity = $3, delivery_location = $4, deadline = $5
       WHERE id = $6 AND buyer_id = $7 RETURNING *`,
      [title, description, quantity, delivery_location, deadline, id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "RFQ not found or unauthorized" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error updating RFQ:", error);
    res.status(500).json({ success: false, message: "Server error updating RFQ" });
  }
};

// Delete an RFQ
export const deleteRFQ = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Verify RFQ exists and belongs to the requesting buyer (or admin)
    const rfqCheck = await pool.query("SELECT * FROM rfqs WHERE id = $1", [id]);

    if (rfqCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "RFQ already deleted or does not exist." });
    }

    if (rfqCheck.rows[0].buyer_id !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this RFQ." });
    }

    // 2. Delete dependent quotes first to prevent foreign key constraint crash
    // (Alternative: Ensure your SQL migration has 'ON DELETE CASCADE' on the quotes table foreign key)
    await pool.query("DELETE FROM quotes WHERE rfq_id = $1", [id]);

    // 3. Delete the RFQ using pool.query (Fixed from undefined 'query')
    await pool.query("DELETE FROM rfqs WHERE id = $1", [id]);

    return res.json({ success: true, id, message: "RFQ deleted successfully." });
  } catch (error) {
    console.error("Error deleting RFQ:", error);
    return res.status(500).json({ success: false, message: "Server error deleting RFQ." });
  }
};