/**
 * index.js is the entry point of the server. It is the file that is run when you start the server.
 * - It is responsible for creating the server, connecting to the database, and defining the routes.
 * - It also sets up middleware for parsing requests and handling CORS.
 */
import express, {json} from 'express'; // Express.js used for creating the server
import cors from 'cors'; // CORS is a Connect/Express middleware for handling cross-origin requests.
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import columnRoutes from './routes/columnRoutes.js';
import mongoose from 'mongoose'; // Mongoose used for connecting to MongoDB
import dotenv from 'dotenv'; 
import cookieParser from 'cookie-parser';
import WebSocketService from './middleware/websocketService.js'; // WebSocket service for real-time communication
import http from 'http'; // HTTP module for creating a server

dotenv.config(); // Load environment variables from .env file

// Create an Express server
const app = express();
//const port = process.env.PORT || 5001;
const server = http.createServer(app); // Create an HTTP server using the Express app
const wss = new WebSocketService(server); // Initialize WebSocket service with the HTTP server
app.locals.wss = wss; // Make available to routes

// Express Middleware set up: allows cookies to flow between client and server
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true, // for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    exposedHeaders: ['set-cookie']
})); 
app.use((req, res, next) => {
    // Attach WebSocket service to the request object to make it accessible in routes and controllers
    req.ws = wss; 
    next();
  });

//app.use(json()); // parse incoming JSON requests

const mongoURI = process.env.MONGO_URI; // MongoDB connection URI

// Connect to the MongoDB database
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);});


// Import routes
app.use('/api/users', userRoutes);
app.use('/settings', userRoutes);
//app.use('/home', projectRoutes);
// app.use("/calendar", taskRoutes);  // Now all "/calendar" requests go to calendarRoutes
// app.use('/gantt', taskRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/kanban', columnRoutes);



// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


// Start the server
server.listen(process.env.PORT, () => {
    console.log(`Server running with WebSocket on port ${process.env.PORT}`);
  });
  
