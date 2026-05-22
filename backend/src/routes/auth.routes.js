const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile, 
  changePassword 
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;