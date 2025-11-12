import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing MongoDB connection...');
console.log('MONGO_URI:', MONGO_URI ? MONGO_URI.replace(/:[^:]*@/, ':****@') : 'NOT SET');

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connection successful!');
  console.log('Connected to:', mongoose.connection.name);
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  if (error.reason) {
    console.error('Reason:', error.reason);
  }
  process.exit(1);
});

// Add connection event listeners
mongoose.connection.on('connecting', () => {
  console.log('⏳ Attempting to connect to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});
