import * as menuService from '../services/menu.service.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * GET /api/v1/menu
 */
export const getMenu = async (req, res, next) => {
  try {
    const menu = await menuService.getAllMenuItems();
    res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/menu/:id
 */
export const getMenuItem = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError('Invalid menu item ID format', 400);
    }
    const item = await menuService.getMenuItemById(id);
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};
