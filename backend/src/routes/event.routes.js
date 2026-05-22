const express = require("express");
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventStats
} = require("../controllers/event.controller");
const { authMiddleware, adminMiddleware, optionalAuthMiddleware } = require("../middleware/auth.middleware");

// Public routes
router.get("/", optionalAuthMiddleware, getAllEvents);
router.get("/stats", authMiddleware, adminMiddleware, getEventStats);
router.get("/:id", optionalAuthMiddleware, getEventById);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createEvent);
router.put("/:id", authMiddleware, adminMiddleware, updateEvent);
router.delete("/:id", authMiddleware, adminMiddleware, deleteEvent);

module.exports = router;