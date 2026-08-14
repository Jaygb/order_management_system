import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitOrderStatusUpdate } from '../config/socket.js';
import { startOrderStatusSimulation } from './simulation.service.js';

// Allowed transition paths
export const VALID_TRANSITIONS = {
  RECEIVED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * Checks if status transition is valid
 */
export const isValidTransition = (currentStatus, newStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
};

/**
 * Generates a unique user-friendly order number (e.g. ORD-170823-7491)
 */
export const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomStr}`;
};

/**
 * Creates a new order with items
 */
export const createOrder = async (orderData) => {
  const { customerName, address, phone, items } = orderData;

  // Retrieve all menu items ordered
  const menuItemIds = items.map((item) => item.menuItemId);
  const dbMenuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  const menuItemMap = new Map(dbMenuItems.map((item) => [item.id, item]));

  // 1. Verify items exist and are available
  for (const item of items) {
    const dbItem = menuItemMap.get(item.menuItemId);
    if (!dbItem) {
      throw new AppError(`Menu item with ID ${item.menuItemId} does not exist`, 404);
    }
    if (!dbItem.isAvailable) {
      throw new AppError(`Menu item "${dbItem.name}" is currently unavailable`, 400);
    }
  }

  // 2. Calculate subtotal and grand total on the backend (never trust frontend totals)
  let totalAmount = 0;
  const orderItemsData = items.map((item) => {
    const dbItem = menuItemMap.get(item.menuItemId);
    const unitPrice = dbItem.price;
    const subtotal = Number((unitPrice * item.quantity).toFixed(2));
    totalAmount += subtotal;

    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    };
  });

  totalAmount = Number(totalAmount.toFixed(2));

  // 3. Create the order and items atomically in a transaction
  const createdOrder = await prisma.$transaction(async (tx) => {
    const orderNumber = generateOrderNumber();
    return tx.order.create({
      data: {
        orderNumber,
        customerName,
        address,
        phone,
        status: 'RECEIVED',
        totalAmount,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  });

  // 4. Trigger background state transitions simulation for real-time demo
  startOrderStatusSimulation(createdOrder.id);

  return createdOrder;
};

/**
 * Get orders with pagination support
 */
export const getAllOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    }),
    prisma.order.count(),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get order by ID
 */
export const getOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(`Order with ID ${id} not found`, 404);
  }

  return order;
};

/**
 * Update general order details (customer details)
 */
export const updateOrder = async (id, updateData) => {
  // Verify order exists
  await getOrderById(id);

  return prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });
};

/**
 * Updates order status and enforces transition constraints
 */
export const updateOrderStatus = async (id, newStatus) => {
  const order = await getOrderById(id);

  // If the status is the same, no-op
  if (order.status === newStatus) {
    return order;
  }

  // Validate state machine boundaries
  if (!isValidTransition(order.status, newStatus)) {
    throw new AppError(`Invalid status transition: cannot change order status from ${order.status} to ${newStatus}`, 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status: newStatus },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  // Broadcast real-time update
  emitOrderStatusUpdate(id, updatedOrder);

  return updatedOrder;
};

/**
 * Deletes an order
 */
export const deleteOrder = async (id) => {
  await getOrderById(id);

  return prisma.order.delete({
    where: { id },
  });
};
