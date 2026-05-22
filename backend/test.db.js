const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('📡 Testing MongoDB Atlas connection...');
  console.log('🔗 Connection string (hidden):', process.env.MONGODB_URI.substring(0, 50) + '...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Host:', mongoose.connection.host);
    await mongoose.connection.close();
    console.log('🎉 Test passed!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();