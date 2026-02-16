import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory, categorySchema } from '../controllers/categories.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', listCategories);
router.post('/', authenticate, requireRole('Editor'), validate(categorySchema), createCategory);
router.put('/:id', authenticate, requireRole('Editor'), validate(categorySchema.partial()), updateCategory);
router.delete('/:id', authenticate, requireRole('Admin'), deleteCategory);

export default router;
