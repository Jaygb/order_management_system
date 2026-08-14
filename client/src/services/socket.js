import { io } from 'socket.io-client';

let socket = null;

/**
 * Initializes and connects the Socket.IO client
 */
export const connectSocket = () => {
  if (!socket) {
    // Falls back to current host origin which works with Vite's WS proxying
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Client connected successfully. Socket ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket.IO] Connection error:', err);
    });
  }
  return socket;
};

/**
 * Disconnects the socket client and cleans reference
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket.IO] Client disconnected.');
  }
};

/**
 * Joins a specific order's status update room
 */
export const joinOrderRoom = (orderId) => {
  const s = socket || connectSocket();
  s.emit('join_order_room', orderId);
};

/**
 * Leaves a specific order's status update room
 */
export const leaveOrderRoom = (orderId) => {
  if (socket) {
    socket.emit('leave_order_room', orderId);
  }
};

/**
 * Sets up listener for order status changes
 */
export const subscribeToStatusUpdates = (callback) => {
  const s = socket || connectSocket();
  s.on('order_status_updated', callback);
};

/**
 * Removes listener for order status changes
 */
export const unsubscribeFromStatusUpdates = () => {
  if (socket) {
    socket.off('order_status_updated');
  }
};
