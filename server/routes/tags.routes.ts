import { Router } from 'express';
import { listTags, createTag, deleteTag, tagSchema } from '../controllers/tags.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', listTags);
router.post('/', authenticate, requireRole('Author', 'Editor'), validate(tagSchema), createTag);
router.delete('/:id', authenticate, requireRole('Editor'), deleteTag);

export default router;
