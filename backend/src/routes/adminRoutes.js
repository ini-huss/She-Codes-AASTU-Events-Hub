// routes/adminRoutes.js

const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");

// Apply both auth and admin middleware to all admin routes
router.use(authMiddleware, adminMiddleware);

// ==================== REGISTRATIONS MANAGEMENT ====================

// Get all registrations
router.get("/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("user", "name email studentId department profilePicture")
      .populate("event", "title date location category")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      registrations,
      total: registrations.length,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);

    res.status(500).json({
      message: "Server error fetching registrations",
      error: error.message,
    });
  }
});

// Get registration by ID
router.get("/registrations/:id", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate("user", "name email studentId department")
      .populate("event", "title date location capacity");

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    res.json({
      success: true,
      registration,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Approve registration
router.put("/registrations/:id/approve", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    registration.status = "approved";
    registration.approvedAt = new Date();
    registration.approvedBy = req.userId;

    await registration.save();

    // Also update the event's registered count if not already counted
    const event = await Event.findById(registration.event);

    if (event) {
      // Check if this registration was already counted
      const existingApproved = await Registration.findOne({
        event: registration.event,
        status: "approved",
        _id: { $ne: registration._id },
      });

      if (!existingApproved) {
        event.registeredCount = (event.registeredCount || 0) + 1;
        await event.save();
      }
    }

    res.json({
      success: true,
      message: "Registration approved successfully",
      registration,
    });
  } catch (error) {
    console.error("Error approving registration:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// Reject registration
router.put("/registrations/:id/reject", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    registration.status = "rejected";
    registration.rejectedAt = new Date();
    registration.rejectedBy = req.userId;
    registration.rejectionReason =
      req.body.reason || "No reason provided";

    await registration.save();

    res.json({
      success: true,
      message: "Registration rejected",
      registration,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==================== ATTENDEES MANAGEMENT ====================

// Get all attendees (approved registrations)
router.get("/attendees", async (req, res) => {
  try {
    const { eventId, search } = req.query;

    let query = { status: "approved" };

    if (eventId) {
      query.event = eventId;
    }

    let attendees = await Registration.find(query)
      .populate(
        "user",
        "name email studentId department profilePicture"
      )
      .populate("event", "title date location");

    // Apply search filter
    if (search) {
      attendees = attendees.filter(
        (attendee) =>
          attendee.user?.name
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          attendee.user?.email
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          attendee.user?.studentId
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      attendees,
      total: attendees.length,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// Check-in attendee
router.put("/attendees/:id/checkin", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    if (registration.checkedIn) {
      return res.status(400).json({
        message: "Already checked in",
      });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();

    await registration.save();

    res.json({
      success: true,
      message: "Checked in successfully",
      registration,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==================== STATISTICS ====================

// Get admin statistics
router.get("/stats", async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();

    const totalRegistrations =
      await Registration.countDocuments();

    const totalAttendees =
      await Registration.countDocuments({
        status: "approved",
      });

    const pendingRegistrations =
      await Registration.countDocuments({
        status: "pending",
      });

    const totalUsers = await User.countDocuments({
      role: "user",
    });

    // Get registrations by event
    const registrationsByEvent = await Registration.aggregate([
      {
        $group: {
          _id: "$event",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "eventInfo",
        },
      },
      {
        $project: {
          eventTitle: {
            $arrayElemAt: ["$eventInfo.title", 0],
          },
          count: 1,
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalRegistrations,
        totalAttendees,
        pendingRegistrations,
        totalUsers,
        registrationsByEvent,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==================== NOTIFICATIONS ====================

// Get all notifications
router.get("/notifications", async (req, res) => {
  try {
    // You'll need to create a Notification model
    // For now, return empty array

    res.json({
      success: true,
      notifications: [],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Send notification
router.post("/notifications", async (req, res) => {
  try {
    const { title, message, audience, eventId } = req.body;

    // Here you would:
    // 1. Save notification to database
    // 2. Send real-time notifications via WebSocket/Email
    // 3. Store in user's notification inbox

    // For now, just return success
    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      notification: {
        title,
        message,
        audience,
        eventId,
        sentBy: req.user.name,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error sending notification:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==================== USERS MANAGEMENT ====================

// Get all users (for admin)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update user role (make admin or remove admin)
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Activate/deactivate user
router.put("/users/:id/toggle-status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    res.json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      }`,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;