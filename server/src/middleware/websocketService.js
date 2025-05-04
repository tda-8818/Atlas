import { WebSocketServer } from 'ws';  // Note: Import WebSocketServer specifically
import jwt from 'jsonwebtoken';

/**
 * WebSocketService class to manage WebSocket connections and events.
 * WebSockets used for real time updates, collaboration and notifications.
 */
export default class WebSocketService {
  /**
   * Constructor to initialize the WebSocket server.
   * @param {http.Server} server - The HTTP server instance.
   */
  constructor(server) {
    // Create WebSocket server
    this.wss = new WebSocketServer({  
      server,
      path: '/ws'
    });
    
    this.clients = new Map();
    this.setupConnectionHandlers();
  }

  /**
   * Sets up connection handlers for incoming WebSocket events.
   * Handles authentication, connection events, and error handling.
   */
  setupConnectionHandlers() {
    // listens for the connection event, each time a new client connects, 
    // The callback function receives two arguments: ws (the WebSocket connection) and req (the HTTP request)

    this.wss.on('connection', (ws, req) => {
      // Extract token from cookies
      const token = req.headers.cookie?.split('; ')
        .find(c => c.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        return ws.close(1008, 'Unauthorized');
      }

      // Verify token and extract user ID
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
   
  /**
   * Sends a notification to a specific user.
   * @param {string} userId - The ID of the user to notify.
   * @param {string} eventType - The type of event to notify about.
   * @param {object} payload - The data to send with the notification.
   */
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