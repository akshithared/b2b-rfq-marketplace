import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), normalizedEmail, passwordHash, role]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to register user.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const result = await query(
      `SELECT id, name, email, password_hash, role, created_at
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    delete user.password_hash;

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
};