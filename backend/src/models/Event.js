const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"]
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"]
    },
    date: {
      type: Date,
      required: [true, "Event date is required"]
    },
    endDate: {
      type: Date
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, "Event capacity is required"],
      min: [1, "Capacity must be at least 1"],
      max: [10000, "Capacity cannot exceed 10000"]
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0
    },
    category: {
      type: String,
      enum: ["tech", "workshop", "seminar", "social", "sports", "arts", "career", "other"],
      default: "other"
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    imageUrl: {
      type: String,
      default: ""
    },
    bannerUrl: {
      type: String,
      default: ""
    },
    organizer: {
      type: String,
      default: "AASTU"
    },
    organizerEmail: {
      type: String,
      lowercase: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    schedule: [{
      time: String,
      activity: String,
      speaker: String
    }],
    speakers: [{
      name: String,
      title: String,
      company: String,
      image: String
    }],
    sponsors: [{
      name: String,
      logo: String,
      website: String
    }],
    isVirtual: {
      type: Boolean,
      default: false
    },
    meetingLink: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for search functionality
eventSchema.index({ title: "text", description: "text", tags: "text" });

// Virtual for checking if event is full
eventSchema.virtual("isFull").get(function() {
  return this.registeredCount >= this.capacity;
});

// Virtual for checking if event is upcoming
eventSchema.virtual("isUpcoming").get(function() {
  return new Date(this.date) > new Date();
});

// Virtual for available spots
eventSchema.virtual("availableSpots").get(function() {
  return this.capacity - this.registeredCount;
});

// Method to check if user can register
eventSchema.methods.canRegister = function() {
  return !this.isFull && this.status === "published" && this.isUpcoming;
};

module.exports = mongoose.model("Event", eventSchema);
