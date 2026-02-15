import { Router } from 'express';
import {
    createNomination,
    getNominations,
    updateNominationStatus,
    getCategories // Assuming we might want a ticket here too or use the same one
} from '../controllers/nominations.controller';
import { issueTicket } from '../controllers/votes.controller';
import { authenticate } from '../middleware/auth';
import { detectFraud } from '../middleware/fraud.middleware';

const router = Router();

// Public routes
router.get('/ticket', issueTicket);
router.get('/categories', getCategories);
router.post('/', detectFraud, createNomination);
router.get('/', getNominations);

// Admin routes
router.patch('/:id/status', authenticate, updateNominationStatus);

export default router;
