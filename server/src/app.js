/**
 * Express app (no listen). Used by local/Render server and Vercel serverless.
 */
import './config/loadEnv.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import labelRoutes from './routes/labelRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import passport from './config/passport.js';
import { pingDatabase } from './db/supabaseClient.js';

const app = express();
app.set('trust proxy', 1);

const clientUrl = process.env.CLIENT_URL;
const serverUrl = process.env.SERVER_URL;

app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' && clientUrl && serverUrl && clientUrl !== serverUrl
      ? 'none'
      : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = [clientUrl, serverUrl].filter(Boolean);
      if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    exposedHeaders: ['set-cookie'],
  })
);

app.get('/api/health', async (req, res) => {
  try {
    await pingDatabase();
    res.status(200).json({ ok: true, db: 'connected', provider: 'supabase' });
  } catch (error) {
    res.status(503).json({
      ok: false,
      db: 'disconnected',
      provider: 'supabase',
      message: error.message,
    });
  }
});

app.use('/api/users', userRoutes);
app.use('/settings', userRoutes);
app.use('/api/settings', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/sprints', sprintRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

export default app;
