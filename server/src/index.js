/**
 * index.js is the entry point of the server.
 * It creates the server, connects to the database, applies middleware, and sets up routes.
 */
import './config/loadEnv.js';
import express from 'express'; // Express.js for creating the server
import cors from 'cors'; // Middleware to handle CORS (Cross-Origin Resource Sharing)
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import labelRoutes from './routes/labelRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import mongoose from 'mongoose'; // Mongoose for connecting to MongoDB
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import WebSocketService from './middleware/websocketService.js'; // WebSocket service
import http from 'http'; // HTTP module for creating a server
import passport from './config/passport.js'; // Passport configuration
import session from 'express-session'; // Session middleware for Passport

// Load environment variables from .env (for local development) or use those provided by Render
dotenv.config();

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

// Session middleware for Passport with extended expiry
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days to match JWT expiry
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

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
mongoose.set('bufferCommands', false);
const mongoURI = process.env.MONGO_URI;

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const mongoState = states[mongoose.connection.readyState] || 'unknown';
  const ok = mongoose.connection.readyState === 1;
  res.status(ok ? 200 : 503).json({
    ok,
    mongo: mongoState,
  });
});

app.use('/api/users', userRoutes);
app.use('/settings', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/sprints', sprintRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

async function start() {
  if (!mongoURI) {
    console.error('MONGO_URI is not set');
  } else {
    try {
      await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });
      console.log(`Connected to MongoDB (${mongoose.connection.name || 'default'})`);
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      console.error('If this mentions IP whitelist, in Atlas go to Network Access and allow 0.0.0.0/0.');
    }
  }

  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`Server running with WebSocket on port ${PORT}`);
  });
}

start();