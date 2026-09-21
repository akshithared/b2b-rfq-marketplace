import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

// Register User
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role && ["BUYER", "SUPPLIER"].includes(role.toUpperCase()) ? role.toUpperCase() : "BUYER";

    const newUser = await query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, userRole]
    );

    const user = newUser.rows[0];

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("Error in registration:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Server error during registration" 
    });
  }
};

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Fetch user by email
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    const user = result.rows[0];

    // 2. Retrieve hashed password from password_hash (or fallback column)
    const storedHash = user.password_hash || user.password;
    if (!storedHash) {
      return res.status(500).json({ success: false, message: "Account setup error: No password hash stored." });
    }

    // 3. Compare passwords using bcrypt
    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
};

// Get Profile
export const getMe = async (req, res) => {
  try {
    const result = await query("SELECT id, name, email, role FROM users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ success: false, message: "Server error fetching profile." });
  }
};