import User from "./models/User.js";
import mongoose from 'mongoose';


const MONGO_URI = "mongodb+srv://ngsweejie:CS2TMS@cs02taskmanagementsyste.ko3ct.mongodb.net/sample_tasks?retryWrites=true&w=majority&appName=CS02TaskManagementSystem";

const test_user = new User({
    id: 12111111,
    firstname: 'TestUser',
    lastname: 'plzwork',
    username: 'testuser',
    password: 'password123',
    email: 'test@example.com'
});

mongoose.connect(MONGO_URI)
.then(() => {
    console.log('Connected to sample_tasks database');
    
    // Create a test user
    const test_user = new User({
      id: 12111111,
      firstname: 'TestUser',
      lastname: 'plzwork',
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
    });
  
    // Save the test user into the 'users' collection in sample_tasks
    test_user.save()
      .then(() => {
        console.log('User saved to sample_tasks database');
      })
      .catch((err) => {
        console.error('Error saving user:', err);
      })
      .finally(() => {
        mongoose.connection.close();  // Close the connection after saving
      });
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });