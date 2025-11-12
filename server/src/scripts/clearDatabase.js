/**
 * Clear Database Script
 * This script clears all collections in the database
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserModel from '../models/UserModel.js';
import ProjectModel from '../models/ProjectModel.js';
import TaskModel from '../models/TaskModel.js';
import ColumnModel from '../models/ColumnModel.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('MONGO_URI is not defined in environment variables');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear all collections
    console.log('\nClearing collections...');

    const userCount = await UserModel.countDocuments();
    await UserModel.deleteMany({});
    console.log(`✓ Deleted ${userCount} users`);

    const projectCount = await ProjectModel.countDocuments();
    await ProjectModel.deleteMany({});
    console.log(`✓ Deleted ${projectCount} projects`);

    const taskCount = await TaskModel.countDocuments();
    await TaskModel.deleteMany({});
    console.log(`✓ Deleted ${taskCount} tasks`);

    const columnCount = await ColumnModel.countDocuments();
    await ColumnModel.deleteMany({});
    console.log(`✓ Deleted ${columnCount} columns`);

    console.log('\n✓ Database cleared successfully!');

    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);

  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
