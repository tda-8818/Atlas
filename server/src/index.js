/**
 * Local / Render entry: HTTP server + optional WebSockets.
 */
import './config/loadEnv.js';
import http from 'http';
import app from './app.js';
import WebSocketService from './middleware/websocketService.js';
import { pingDatabase } from './db/supabaseClient.js';

const server = http.createServer(app);
const wss = new WebSocketService(server);
app.locals.wss = wss;

async function start() {
  try {
    await pingDatabase();
    console.log('Connected to Supabase Postgres');
  } catch (err) {
    console.error('Supabase connection error:', err.message);
  }

  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
