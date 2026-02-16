import { Router } from 'express';
import { createComment, listComments, approveComment, deleteComment, commentSchema } from '../controllers/comments.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// Public
router.post('/:articleId', validate(commentSchema), createComment);
router.get('/:articleId', listComments);

// Admin / Editor
router.get('/', authenticate, requireRole('Editor'), listComments);

// Admin / Editor
router.patch('/:id/approve', authenticate, requireRole('Editor'), approveComment);
router.delete('/:id', authenticate, requireRole('Editor'), deleteComment);

export default router;
