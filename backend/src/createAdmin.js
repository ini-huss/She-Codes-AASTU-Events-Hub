// createAdmin.js - Run this file to create admin user

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema (copy from your existing schema)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profilePicture: { type: String, default: "" },
  department: { type: String, default: "" },
  studentId: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/aastu-events-hub", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log("Connected to MongoDB");
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@aastu.edu.et" });
    
    if (existingAdmin) {
      console.log("Admin already exists!");
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    
    // Create admin user
    const admin = new User({
      name: "System Administrator",
      email: "admin@aastu.edu.et",
      password: hashedPassword,
      role: "admin",
      department: "ICT Directorate",
      studentId: "ADMIN001",
      isActive: true
    });
    
    await admin.save();
    
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@aastu.edu.et");
    console.log("🔑 Password: Admin@123");
    console.log("⚠️  Please change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();