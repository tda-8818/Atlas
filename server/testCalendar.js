/**
 * index.js is the entry point of the server. It is the file that is run when you start the server.
 * - It is responsible for creating the server, connecting to the database, and defining the routes.
 * - Handles API endpoints for user login and signup.
 */
import express, {json, response} from 'express'; // Express.js used for creating the server
import cors from 'cors'; // CORS is a Connect/Express middleware for handling cross-origin requests.
import { connect } from 'mongoose'; // Mongoose used for connecting to MongoDB
import UserModel from "./models/UserModel.js";
import bcrypt from 'bcrypt';
import Task from './models/TaskModel.js';
import taskRoute from './routes/task.routes.js';
// Create an Express server
const app = express();
const port = 5001;

// Middleware set up:

app.use(cors()); 
app.use(json()); // parse incoming JSON requests
app.use(express.json());
// Connect to the MongoDB database
const MONGO_URI = "mongodb+srv://ngsweejie:CS2TMS@cs02taskmanagementsyste.ko3ct.mongodb.net/users?retryWrites=true&w=majority&appName=CS02TaskManagementSystem";
connect(MONGO_URI);


// Routes
app.use("/calendar", taskRoute);  // Now all "/calendar" requests go to calendarRoutes

app.use('/gantt', taskRoute);


// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});