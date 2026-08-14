import { Server } from 'socket.io';

let io = null;

/**
 * Initialize Socket.IO server
 */
export const initSocket = (server, clientUrl) => {
  io = new Server(server, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Subscribe to order status changes
    socket.on('join_order_room', (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined room: order:${orderId}`);
      }
    });

    // Unsubscribe from order status changes
    socket.on('leave_order_room', (orderId) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
        console.log(`[Socket.IO] Socket ${socket.id} left room: order:${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get active Socket.IO server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet!');
  }
  return io;
};

/**
 * Emit order status update to a specific room
 */
export const emitOrderStatusUpdate = (orderId, orderData) => {
  if (io) {
    io.to(`order:${orderId}`).emit('order_status_updated', orderData);
    console.log(`[Socket.IO] Emitted 'order_status_updated' to room 'order:${orderId}': status=${orderData.status}`);
  } else {
    console.warn('[Socket.IO] Warning: Cannot emit status update, io instance is not initialized.');
  }
};
