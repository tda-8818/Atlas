/**
 * index.js is the entry point of the server. It is the file that is run when you start the server.
 * - It is responsible for creating the server, connecting to the database, and defining the routes.
 * - Handles API endpoints for user login and signup.
 */
import express, {json} from 'express'; // Express.js used for creating the server
import cors from 'cors'; // CORS is a Connect/Express middleware for handling cross-origin requests.
import userRoutes from './routes/userRoutes.js';
//import projectRoutes from './routes/projectRoutes.js';
//import taskRoutes from './routes/taskRoutes.js';
import { connect } from 'mongoose'; // Mongoose used for connecting to MongoDB
import path from 'path'; // Path module provides utilities for working with file and directory paths
import { fileURLToPath } from 'url'; // fileURLToPath is used to convert a URL to a file path

// Create an Express server
const app = express();
const port = 5001;

// Middleware set up:
app.use(cors()); 
app.use(json()); // parse incoming JSON requests

// Connect to the MongoDB database
const MONGO_URI = "mongodb+srv://ngsweejie:CS2TMS@cs02taskmanagementsyste.ko3ct.mongodb.net/users?retryWrites=true&w=majority&appName=CS02TaskManagementSystem";
connect(MONGO_URI);


// Import routes
app.use('/api/users', userRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/projects', projectRoutes);

// Get the current directory using import.meta.url
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

// Serve static files from the React app
app.use(express.static(path.join(dirName, '../client/dist')));
// Serve the index.html file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(dirName, '../client/dist/index.html'));
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
