import { Router } from 'express';
import { listTags, createTag, deleteTag, tagSchema } from '../controllers/tags.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', listTags);
router.post('/', authenticate, requireRole('Author', 'Editor'), validate(tagSchema), createTag);
router.delete('/:id', authenticate, requireRole('Editor'), deleteTag);

export default router;
