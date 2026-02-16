import { Router } from 'express';
import { listUsers, updateUser, listRoles, createUser, deleteUser } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

router.get('/', authenticate, requireRole('Admin'), listUsers);
router.get('/roles', authenticate, requireRole('Admin'), listRoles);
router.post('/', authenticate, requireRole('Admin'), createUser);
router.put('/:id', authenticate, requireRole('Admin'), updateUser);
router.delete('/:id', authenticate, requireRole('Admin'), deleteUser);

export default router;
