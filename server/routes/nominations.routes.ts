import { Router } from 'express';
import {
    createNomination,
    createNominationAdmin,
    getNominations,
    updateNomination,
    updateNominationStatus,
    deleteNomination,
    bulkUpdateNominationStatus,
    getCategories,
    createAwardCategory,
    updateAwardCategory,
    deleteAwardCategory,
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

// Admin: Category CRUD
router.post('/categories', authenticate, createAwardCategory);
router.patch('/categories/:id', authenticate, updateAwardCategory);
router.delete('/categories/:id', authenticate, deleteAwardCategory);

// Admin: Nomination CRUD
router.post('/admin', authenticate, createNominationAdmin);
router.patch('/admin/bulk-status', authenticate, bulkUpdateNominationStatus);
router.patch('/:id', authenticate, updateNomination);
router.patch('/:id/status', authenticate, updateNominationStatus);
router.delete('/:id', authenticate, deleteNomination);

export default router;
