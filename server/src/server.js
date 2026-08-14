import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { initSocket } from './config/socket.js';
import prisma from './config/database.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server
initSocket(server, CLIENT_URL);

/**
 * Start DB connection and listen for incoming HTTP traffic
 */
async function start() {
  try {
    await prisma.$connect();
    console.log('[Database] Successfully connected to PostgreSQL.');
    
    server.listen(PORT, () => {
      console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Startup Error] Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Clean shutdown listeners
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[Server] Graceful shutdown completed.');
    process.exit(0);
  });
});

start();
