import prisma from '../config/database.js';
import { emitOrderStatusUpdate } from '../config/socket.js';

/**
 * Simulates order status changes automatically for evaluation:
 * RECEIVED -> PREPARING (10s) -> OUT_FOR_DELIVERY (20s) -> DELIVERED (30s)
 */
export const startOrderStatusSimulation = (orderId) => {
  const transitions = [
    { status: 'PREPARING', delay: 10000 },
    { status: 'OUT_FOR_DELIVERY', delay: 20000 },
    { status: 'DELIVERED', delay: 30000 },
  ];

  transitions.forEach(({ status, delay }) => {
    setTimeout(async () => {
      try {
        // Fetch current state of the order to check if it was cancelled
        const currentOrder = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (!currentOrder) {
          console.log(`[Simulation] Order ${orderId} not found, stopping simulation.`);
          return;
        }

        // If the order was cancelled or already delivered, stop transitions
        if (currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED') {
          console.log(`[Simulation] Order ${orderId} status is ${currentOrder.status}, skipping transition to ${status}.`);
          return;
        }

        // Perform the status update
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status },
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        });

        // Broadcast the real-time update
        emitOrderStatusUpdate(orderId, updatedOrder);
        console.log(`[Simulation] Order ${orderId} successfully transitioned to ${status}`);
      } catch (error) {
        console.error(`[Simulation Error] Failed to transition order ${orderId} to ${status}:`, error);
      }
    }, delay);
  });
};
