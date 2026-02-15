import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory, categorySchema } from '../controllers/categories.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', listCategories);
router.post('/', authenticate, requireRole('Editor'), validate(categorySchema), createCategory);
router.put('/:id', authenticate, requireRole('Editor'), validate(categorySchema.partial()), updateCategory);
router.delete('/:id', authenticate, requireRole('Admin'), deleteCategory);

export default router;
