import { z } from 'zod';

// Simple phone validator: allows spaces, dashes, parentheses and digits, minimum 8 digits
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string({
      required_error: 'Customer name is required',
    }).min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters'),
    address: z.string({
      required_error: 'Delivery address is required',
    }).min(5, 'Address must be at least 5 characters long')
      .max(255, 'Address cannot exceed 255 characters'),
    phone: z.string({
      required_error: 'Phone number is required',
    }).min(8, 'Phone number must be at least 8 characters long')
      .regex(phoneRegex, 'Invalid phone number format'),
    items: z.array(
      z.object({
        menuItemId: z.number({
          required_error: 'Menu item ID is required',
        }).int('Menu item ID must be an integer').positive('Invalid menu item ID format'),
        quantity: z.number({
          required_error: 'Quantity is required',
        }).int('Quantity must be an integer').positive('Quantity must be greater than 0'),
      })
    ).min(1, 'Order must contain at least one item'),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int('Order ID must be an integer').positive('Invalid order ID format'),
  }),
  body: z.object({
    status: z.enum(['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'], {
      error_map: () => ({ message: 'Invalid order status value. Allowed: RECEIVED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED' }),
    }),
  }),
});

export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int('Order ID must be an integer').positive('Invalid order ID format'),
  }),
});

export const updateOrderSchema = z.object({
  params: z.object({
    id: z.coerce.number().int('Order ID must be an integer').positive('Invalid order ID format'),
  }),
  body: z.object({
    customerName: z.string().min(2, 'Name must be at least 2 characters long').optional(),
    address: z.string().min(5, 'Address must be at least 5 characters long').optional(),
    phone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
    status: z.enum(['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).optional(),
  }),
});
