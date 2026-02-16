import { Router } from 'express';
import { listPages, getPage, createPage, updatePage, deletePage, pageSchema } from '../controllers/pages.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', listPages);
router.get('/:slug', getPage);
router.post('/', authenticate, requireRole('Editor'), validate(pageSchema), createPage);
router.put('/:id', authenticate, requireRole('Editor'), validate(pageSchema.partial()), updatePage);
router.delete('/:id', authenticate, requireRole('Admin'), deletePage);

export default router;
