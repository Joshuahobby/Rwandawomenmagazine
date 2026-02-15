import { Router } from 'express';
import { subscribe, listSubscribers, unsubscribe, subscriberSchema } from '../controllers/subscribers.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// Public
router.post('/', validate(subscriberSchema), subscribe);

// Admin
router.get('/', authenticate, requireRole('Admin', 'Editor'), listSubscribers);
router.patch('/:id/unsubscribe', authenticate, requireRole('Admin'), unsubscribe);

export default router;
