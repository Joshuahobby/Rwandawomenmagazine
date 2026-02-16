import { Router } from 'express';
import { trackView, getDashboardStats, getViewStats } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// Public — track views
router.post('/views/:articleId', trackView);

// Admin only
router.get('/dashboard', authenticate, requireRole('Editor'), getDashboardStats);
router.get('/views', authenticate, requireRole('Editor'), getViewStats);

export default router;
