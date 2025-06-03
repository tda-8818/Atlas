/**
 * index.js is the entry point of the server.
 * It creates the server, connects to the database, applies middleware, and sets up routes.
 */
import express from 'express'; // Express.js for creating the server
import cors from 'cors'; // Middleware to handle CORS (Cross-Origin Resource Sharing)
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import mongoose from 'mongoose'; // Mongoose for connecting to MongoDB
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import WebSocketService from './middleware/websocketService.js'; // WebSocket service
import http from 'http'; // HTTP module for creating a server

// Load environment variables from .env (for local development) or use those provided by Render
dotenv.config();

console.log('Backend CLIENT_URL (from env):', process.env.CLIENT_URL);
console.log('Backend clientUrl variable:', clientUrl);

// Create an Express server
const app = express();
const server = http.createServer(app);
const wss = new WebSocketService(server);
app.locals.wss = wss;

// IMPORTANT: Add this line to trust proxy headers from Render (for express-rate-limit and accurate IP)
app.set('trust proxy', 1);

// Use environment variable for the client URL, fallback to localhost if not provided
const clientUrl =  process.env.CLIENT_URL;

// Express Middleware Setup
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: clientUrl, // Allow requests from the client URL defined in your environment
    credentials: true, // Enable cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    exposedHeaders: ['set-cookie']
  })
);

// Attach WebSocket service to each request
app.use((req, res, next) => {
  req.ws = wss;
  next();
});

// MongoDB connection using environment variable for URI
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Import and use routes
app.use('/api/users', userRoutes);
app.use('/settings', userRoutes); // Note: /settings path, ensure this is intended for user routes
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server on the port provided via environment variable, fallback to 5001 if not defined
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running with WebSocket on port ${PORT}`);
});