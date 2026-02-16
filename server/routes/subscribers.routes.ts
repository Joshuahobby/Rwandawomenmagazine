import { Router } from 'express';
import { subscribe, listSubscribers, unsubscribe, subscriberSchema } from '../controllers/subscribers.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Public
router.post('/', validate(subscriberSchema), subscribe);

// Admin
router.get('/', authenticate, requireRole('Admin', 'Editor'), listSubscribers);
router.patch('/:id/unsubscribe', authenticate, requireRole('Admin'), unsubscribe);

export default router;
