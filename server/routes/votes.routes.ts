import { Router } from 'express';
import { castVote, getResults, getCategoryResults, issueTicket, getVoteAuditLog } from '../controllers/votes.controller';
import { detectFraud } from '../middleware/fraud.middleware';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/ticket', issueTicket);
router.post('/', detectFraud, castVote);
router.get('/results', getResults);
router.get('/results/:categoryId', getCategoryResults);

// Admin routes
router.get('/admin/audit-log', authenticate, getVoteAuditLog);

export default router;
