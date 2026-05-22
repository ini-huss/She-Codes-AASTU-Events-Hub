const mongoose = require('mongoose');
require('dotenv').config();

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const result = await mongoose.connection.db
      .collection('users')
      .updateOne(
        { email: "test@aastu.edu.et" },
        { $set: { role: "admin" } }
      );
    
    console.log('✅ User updated:', result.modifiedCount === 1);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

makeAdmin();