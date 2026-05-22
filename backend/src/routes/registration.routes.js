const express = require("express");
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getUserRegistrations,
  getRegistrationById,
  getEventRegistrations,
  checkInAttendee,
  submitFeedback
} = require("../controllers/registration.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.middleware");

// Protected routes (require authentication)
router.get("/my-registrations", authMiddleware, getUserRegistrations);
router.get("/:id", authMiddleware, getRegistrationById);
router.post("/:eventId/register", authMiddleware, registerForEvent);
router.delete("/:registrationId/cancel", authMiddleware, cancelRegistration);
router.post("/:registrationId/feedback", authMiddleware, submitFeedback);

// Admin only routes
router.get("/events/:eventId/registrations", authMiddleware, adminMiddleware, getEventRegistrations);
router.post("/:registrationId/check-in", authMiddleware, adminMiddleware, checkInAttendee);

module.exports = router;