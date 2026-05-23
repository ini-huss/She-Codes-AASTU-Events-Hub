const express = require("express");
const cors    = require("cors");
const mongoose = require("mongoose");

const authRoutes         = require("./routes/auth.routes");
const eventRoutes        = require("./routes/event.routes");
const registrationRoutes = require("./routes/registration.routes");
const adminRoutes        = require("./routes/adminRoutes");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.STUDENT_URL,
    process.env.ADMIN_URL,
  ].filter(Boolean),
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logging ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/events",        eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/admin",         adminRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status:    "OK",
    message:   "AASTU Events Hub API is running",
    timestamp: new Date().toISOString(),
    mongodb:   mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ── Root ──────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to AASTU Events Hub API",
    version: "1.0.0",
    endpoints: {
      auth:          "/api/auth",
      events:        "/api/events",
      registrations: "/api/registrations",
      admin:         "/api/admin",
      health:        "/api/health",
    },
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.path} not found` });
});

module.exports = app;
