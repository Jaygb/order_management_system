import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Get all menu items from database
 */
export const getAllMenuItems = async () => {
  return prisma.menuItem.findMany({
    orderBy: {
      name: 'asc',
    },
  });
};

/**
 * Get menu item by ID
 */
export const getMenuItemById = async (id) => {
  const item = await prisma.menuItem.findUnique({
    where: { id },
  });
  if (!item) {
    throw new AppError(`Menu item with ID ${id} not found`, 404);
  }
  return item;
};
