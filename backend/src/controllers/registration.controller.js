 const Registration = require("../models/Registration");
const Event = require("../models/Event");

// Register for an event
const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        message: "Event not found",
        error: "EVENT_NOT_FOUND"
      });
    }

    // Check if event can accept registrations
    if (!event.canRegister()) {
      let message = "Cannot register for this event";
      if (event.isFull) message = "Event is at full capacity";
      if (event.status !== "published") message = "Event is not open for registration";
      if (!event.isUpcoming) message = "Event has already passed";
      
      return res.status(400).json({ 
        message,
        error: "REGISTRATION_NOT_ALLOWED"
      });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      user: userId,
      event: eventId,
      status: { $ne: "cancelled" }
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        message: "You are already registered for this event",
        error: "ALREADY_REGISTERED"
      });
    }

    // Create registration
    const registration = new Registration({
      user: userId,
      event: eventId,
      paymentStatus: event.price > 0 ? "pending" : "completed",
      paymentMethod: event.price > 0 ? "telebirr" : "free",
      amountPaid: event.price
    });

    await registration.save();

    // Increment registered count
    event.registeredCount += 1;
    await event.save();

    res.status(201).json({
      message: "Successfully registered for event",
      registration,
      ticketNumber: registration.ticketNumber
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "You are already registered for this event",
        error: "DUPLICATE_REGISTRATION"
      });
    }
    res.status(500).json({ 
      message: "Server error during registration",
      error: error.message 
    });
  }
};

// Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const registrationId = req.params.registrationId;
    const userId = req.user._id;

    const registration = await Registration.findOne({
      _id: registrationId,
      user: userId
    });

    if (!registration) {
      return res.status(404).json({ 
        message: "Registration not found",
        error: "REGISTRATION_NOT_FOUND"
      });
    }

    if (registration.status === "cancelled") {
      return res.status(400).json({ 
        message: "Registration already cancelled",
        error: "ALREADY_CANCELLED"
      });
    }

    const event = await Event.findById(registration.event);
    if (!event) {
      return res.status(404).json({ 
        message: "Event not found",
        error: "EVENT_NOT_FOUND"
      });
    }

    // Check if cancellation is allowed (e.g., at least 24 hours before event)
    const hoursUntilEvent = (new Date(event.date) - new Date()) / (1000 * 60 * 60);
    if (hoursUntilEvent < 24 && hoursUntilEvent > 0) {
      return res.status(400).json({ 
        message: "Cannot cancel less than 24 hours before event",
        error: "CANCELLATION_NOT_ALLOWED"
      });
    }

    // Update registration status
    registration.status = "cancelled";
    await registration.save();

    // Decrement registered count
    if (event.registeredCount > 0) {
      event.registeredCount -= 1;
      await event.save();
    }

    res.json({ 
      message: "Registration cancelled successfully",
      registration
    });
  } catch (error) {
    console.error("Cancel registration error:", error);
    res.status(500).json({ 
      message: "Server error cancelling registration",
      error: error.message 
    });
  }
};

// Get user's registrations
const getUserRegistrations = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    let registrations = await Registration.find(query)
      .sort({ createdAt: -1 });

    // Filter upcoming events
    if (upcoming === "true") {
      registrations = registrations.filter(reg => 
        new Date(reg.event.date) > new Date() && reg.status !== "cancelled"
      );
    }

    res.json(registrations);
  } catch (error) {
    console.error("Get user registrations error:", error);
    res.status(500).json({ 
      message: "Server error fetching registrations",
      error: error.message 
    });
  }
};

// Get single registration details
const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate("user", "name email studentId")
      .populate("event");

    if (!registration) {
      return res.status(404).json({ 
        message: "Registration not found",
        error: "REGISTRATION_NOT_FOUND"
      });
    }

    // Check if user owns this registration or is admin
    if (registration.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ 
        message: "Access denied",
        error: "ACCESS_DENIED"
      });
    }

    res.json(registration);
  } catch (error) {
    console.error("Get registration error:", error);
    res.status(500).json({ 
      message: "Server error fetching registration",
      error: error.message 
    });
  }
};

// Get all registrations for an event (Admin only)
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    let query = { event: eventId };
    if (status) query.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [registrations, total] = await Promise.all([
      Registration.find(query)
        .populate("user", "name email studentId department")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Registration.countDocuments(query)
    ]);

    res.json({
      registrations,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRegistrations: total
      }
    });
  } catch (error) {
    console.error("Get event registrations error:", error);
    res.status(500).json({ 
      message: "Server error fetching registrations",
      error: error.message 
    });
  }
};

// Check-in attendee (Admin only)
const checkInAttendee = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { attendanceCode } = req.body;

    const registration = await Registration.findById(registrationId);
    
    if (!registration) {
      return res.status(404).json({ 
        message: "Registration not found",
        error: "REGISTRATION_NOT_FOUND"
      });
    }

    if (registration.checkedIn) {
      return res.status(400).json({ 
        message: "Already checked in",
        error: "ALREADY_CHECKED_IN"
      });
    }

    // Verify attendance code if provided
    if (attendanceCode && registration.attendanceCode !== attendanceCode) {
      return res.status(400).json({ 
        message: "Invalid attendance code",
        error: "INVALID_CODE"
      });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    registration.status = "attended";
    await registration.save();

    res.json({
      message: "Checked in successfully",
      registration
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ 
      message: "Server error during check-in",
      error: error.message 
    });
  }
};

// Submit feedback for event
const submitFeedback = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { rating, comment } = req.body;

    const registration = await Registration.findOne({
      _id: registrationId,
      user: req.user._id
    });

    if (!registration) {
      return res.status(404).json({ 
        message: "Registration not found",
        error: "REGISTRATION_NOT_FOUND"
      });
    }

    if (registration.feedback && registration.feedback.rating) {
      return res.status(400).json({ 
        message: "Feedback already submitted",
        error: "FEEDBACK_EXISTS"
      });
    }

    registration.feedback = { rating, comment };
    await registration.save();

    res.json({
      message: "Feedback submitted successfully",
      registration
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({ 
      message: "Server error submitting feedback",
      error: error.message 
    });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getUserRegistrations,
  getRegistrationById,
  getEventRegistrations,
  checkInAttendee,
  submitFeedback
};