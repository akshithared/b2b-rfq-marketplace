import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid or expired token." });
  }
};

export const isBuyer = (req, res, next) => {
  if (req.user && req.user.role === "BUYER") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access restricted to Buyers only." });
  }
};

export const isSupplier = (req, res, next) => {
  if (req.user && req.user.role === "SUPPLIER") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access restricted to Suppliers only." });
  }
};

export default {
  verifyToken,
  isBuyer,
  isSupplier,
};