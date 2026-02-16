import { Router } from 'express';
import { castVote, getResults, getCategoryResults, issueTicket } from '../controllers/votes.controller';
import { detectFraud } from '../middleware/fraud.middleware';

const router = Router();

// Public routes
router.get('/ticket', issueTicket);
router.post('/', detectFraud, castVote);
router.get('/results', getResults);
router.get('/results/:categoryId', getCategoryResults);

export default router;
