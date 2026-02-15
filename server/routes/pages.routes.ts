import { Router } from 'express';
import { listPages, getPage, createPage, updatePage, deletePage, pageSchema } from '../controllers/pages.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', listPages);
router.get('/:slug', getPage);
router.post('/', authenticate, requireRole('Editor'), validate(pageSchema), createPage);
router.put('/:id', authenticate, requireRole('Editor'), validate(pageSchema.partial()), updatePage);
router.delete('/:id', authenticate, requireRole('Admin'), deletePage);

export default router;
