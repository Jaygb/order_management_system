import { Router } from 'express';
import * as menuController from '../controllers/menu.controller.js';

const router = Router();

router.get('/', menuController.getMenu);
router.get('/:id', menuController.getMenuItem);

export default router;
