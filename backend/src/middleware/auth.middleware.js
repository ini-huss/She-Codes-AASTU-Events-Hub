const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        message: "Access denied. No token provided.",
        error: "AUTH_TOKEN_MISSING"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid token. User not found.",
        error: "AUTH_USER_NOT_FOUND"
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: "Account is deactivated. Please contact support.",
        error: "AUTH_ACCOUNT_INACTIVE"
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        message: "Invalid token.",
        error: "AUTH_INVALID_TOKEN"
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token expired. Please login again.",
        error: "AUTH_TOKEN_EXPIRED"
      });
    }
    
    console.error("Auth middleware error:", error);
    res.status(500).json({ 
      message: "Authentication error",
      error: error.message 
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ 
      message: "Access denied. Admin privileges required.",
      error: "AUTH_ADMIN_REQUIRED"
    });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }
    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

module.exports = { 
  authMiddleware, 
  adminMiddleware, 
  optionalAuthMiddleware 
};
