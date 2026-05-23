const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    status: {
      type: String,
      enum: ["registered", "cancelled", "attended", "no_show", "approved", "rejected", "pending"],
      default: "registered"
    },
    ticketNumber: {
      type: String,
      unique: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "refunded"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["free", "telebirr", "cash", "bank"],
      default: "free"
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkedInAt: {
      type: Date
    },
    attendanceCode: {
      type: String
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Generate unique ticket number before saving
registrationSchema.pre("save", async function(next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.ticketNumber = `AASTU-${timestamp}-${random}`;
  }
  next();
});

// Populate references by default
registrationSchema.pre(/^find/, function(next) {
  this.populate("user", "name email profilePicture")
      .populate("event", "title date location price category");
  next();
});

module.exports = mongoose.model("Registration", registrationSchema);
