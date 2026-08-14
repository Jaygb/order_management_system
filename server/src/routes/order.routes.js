import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrderByIdSchema,
  updateOrderSchema,
} from '../validation/order.validation.js';

const router = Router();

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', validate(getOrderByIdSchema), orderController.getOrder);
router.put('/:id', validate(updateOrderSchema), orderController.updateOrder);
router.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);
router.delete('/:id', validate(getOrderByIdSchema), orderController.deleteOrder);

export default router;
