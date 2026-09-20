const validRoles = ["BUYER", "SUPPLIER"];

export const validateRegistration = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Name, email, password, and role are required.",
    });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Name must contain at least 2 characters.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  // Strong password rule: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
    });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role must be BUYER or SUPPLIER.",
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  next();
};