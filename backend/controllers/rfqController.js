import { query } from "../config/db.js";

// Create a new RFQ (Buyer only)
export const createRFQ = async (req, res) => {
  try {
    const { title, description, quantity, delivery_location, deadline } = req.body;
    const buyerId = req.user.id;

    if (!title || !description || !quantity || !delivery_location || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Title, description, quantity, delivery location, and deadline are required.",
      });
    }

    const result = await query(
      `INSERT INTO rfqs (buyer_id, title, description, quantity, delivery_location, deadline)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [buyerId, title.trim(), description.trim(), quantity, delivery_location.trim(), deadline]
    );

    return res.status(201).json({
      success: true,
      message: "RFQ created successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating RFQ:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create RFQ.",
    });
  }
};

// Get RFQs (Buyers get their own; Suppliers get all open RFQs with optional search)
export const getRFQs = async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = "";
    let params = [];

    if (req.user.role === "BUYER") {
      queryText = "SELECT * FROM rfqs WHERE buyer_id = $1 ORDER BY created_at DESC";
      params = [req.user.id];
    } else {
      if (search) {
        queryText = `SELECT * FROM rfqs WHERE status = 'OPEN' AND (title ILIKE $1 OR description ILIKE $1) ORDER BY created_at DESC`;
        params = [`%${search}%`];
      } else {
        queryText = "SELECT * FROM rfqs WHERE status = 'OPEN' ORDER BY created_at DESC";
      }
    }

    const result = await query(queryText, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching RFQs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch RFQs.",
    });
  }
};