import { Router } from 'express';
import { listUsers, updateUser, listRoles, createUser, deleteUser } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

router.get('/', authenticate, requireRole('Admin'), listUsers);
router.get('/roles', authenticate, requireRole('Admin'), listRoles);
router.post('/', authenticate, requireRole('Admin'), createUser);
router.put('/:id', authenticate, requireRole('Admin'), updateUser);
router.delete('/:id', authenticate, requireRole('Admin'), deleteUser);

export default router;
