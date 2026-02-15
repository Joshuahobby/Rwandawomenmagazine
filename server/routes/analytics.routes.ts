import { Router } from 'express';
import { trackView, getDashboardStats, getViewStats } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// Public — track views
router.post('/views/:articleId', trackView);

// Admin only
router.get('/dashboard', authenticate, requireRole('Editor'), getDashboardStats);
router.get('/views', authenticate, requireRole('Editor'), getViewStats);

export default router;
