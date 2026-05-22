 // backend/src/controllers/event.controller.js

const Event = require("../models/Event");
const Registration = require("../models/Registration");

// Create Event (Admin only)
const createEvent = async (req, res) => {
  try {
    console.log("Creating event with data:", req.body);
    
    const eventData = {
      ...req.body,
      createdBy: req.user._id,
      registeredCount: 0
    };

    // Validate date
    if (eventData.date && new Date(eventData.date) < new Date()) {
      return res.status(400).json({ 
        message: "Event date cannot be in the past",
        error: "INVALID_DATE"
      });
    }

    const event = new Event(eventData);
    await event.save();
    
    console.log("Event created successfully:", event._id);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error creating event",
      error: error.message 
    });
  }
};

// Get All Events with filters and pagination
const getAllEvents = async (req, res) => {
  try {
    const { 
      category, 
      upcoming, 
      past,
      search,
      page = 1,
      limit = 12,
      sortBy = "date",
      sortOrder = "asc"
    } = req.query;

    let query = { status: "published" };

    // If admin, show all events (including drafts)
    if (req.user && req.user.role === "admin") {
      query = {};
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Filter by date
    const now = new Date();
    if (upcoming === "true") {
      query.date = { $gte: now };
    } else if (past === "true") {
      query.date = { $lt: now };
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(query)
    ]);

    res.json({
      success: true,
      events,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalEvents: total,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching events",
      error: error.message 
    });
  }
};

// Get Single Event
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found",
        error: "EVENT_NOT_FOUND"
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching event",
      error: error.message 
    });
  }
};

// Update Event (Admin only)
const updateEvent = async (req, res) => {
  try {
    console.log("Updating event:", req.params.id);
    console.log("Update data:", req.body);
    
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found",
        error: "EVENT_NOT_FOUND"
      });
    }
     // Don't allow updating certain fields
    const updates = req.body;
    delete updates._id;
    delete updates.createdBy;
    delete updates.registeredCount;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    console.log("Event updated successfully:", req.params.id);

    res.json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error updating event",
      error: error.message 
    });
  }
};

// Delete Event (Admin only)
const deleteEvent = async (req, res) => {
  try {
    console.log("Deleting event:", req.params.id);
    
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found",
        error: "EVENT_NOT_FOUND"
      });
    }

    // Delete all registrations for this event
    await Registration.deleteMany({ event: event._id });
    
    // Delete the event
    await event.deleteOne();

    console.log("Event deleted successfully:", req.params.id);

    res.json({ 
      success: true,
      message: "Event deleted successfully",
      deletedEventId: req.params.id
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error deleting event",
      error: error.message 
    });
  }
};

// Get Event Statistics (Admin only)
const getEventStats = async (req, res) => {
  try {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalCapacity: { $sum: "$capacity" },
          totalRegistered: { $sum: "$registeredCount" }
        }
      }
    ]);

    const upcomingCount = await Event.countDocuments({
      date: { $gte: new Date() },
      status: "published"
    });

    const pastCount = await Event.countDocuments({
      date: { $lt: new Date() },
      status: "published"
    });

    res.json({
      success: true,
      categoryStats: stats,
      upcomingEvents: upcomingCount,
      pastEvents: pastCount,
      totalEvents: upcomingCount + pastCount
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching stats",
      error: error.message 
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventStats
};