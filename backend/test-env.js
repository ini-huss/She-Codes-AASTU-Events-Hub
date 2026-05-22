require("dotenv").config();

console.log("Testing .env file loading...");
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Loaded" : "✗ Not loaded");