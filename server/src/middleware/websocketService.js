import { WebSocketServer } from 'ws';  // Note: Import WebSocketServer specifically
import jwt from 'jsonwebtoken';

/**
 * WebSocketService class to manage WebSocket connections and events.
 * WebSockets used for real time updates, collaboration and notifications.
 */
export default class WebSocketService {
  constructor(server) {
    // Create WebSocket server
    this.wss = new WebSocketServer({  
      server,
      path: '/ws'
    });
    
    this.clients = new Map();
    this.setupConnectionHandlers();
  }

  setupConnectionHandlers() {
    this.wss.on('connection', (ws, req) => {
      // Extract token from cookies
      const token = req.headers.cookie?.split('; ')
        .find(c => c.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        return ws.close(1008, 'Unauthorized');
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        this.clients.set(decoded.userId, ws);
        
        ws.on('close', () => {
          this.clients.delete(decoded.userId);
        });
        
        ws.on('error', (err) => {
          console.error('WebSocket error:', err);
        });
        
      } catch (err) {
        ws.close(1008, 'Invalid token');
      }
    });
  }

  notifyUser(userId, eventType, payload) {
    const client = this.clients.get(userId.toString());
    if (client?.readyState === this.wss.OPEN) {
      client.send(JSON.stringify({
        type: eventType,
        data: payload
      }));
    }
  }
}