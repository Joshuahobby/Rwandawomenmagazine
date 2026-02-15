import { Router } from 'express';
import {
    listArticles, getArticleById, getArticle, createArticle, updateArticle,
    updateStatus, deleteArticle, getRevisions,
    createArticleSchema, updateArticleSchema, statusSchema,
} from '../controllers/articles.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// Public
router.get('/', listArticles);
router.get('/id/:id', getArticleById);
router.get('/:slug', getArticle);

// Auth required
router.post('/', authenticate, requireRole('Author', 'Editor'), validate(createArticleSchema), createArticle);
router.put('/:id', authenticate, requireRole('Author', 'Editor'), validate(updateArticleSchema), updateArticle);
router.patch('/:id/status', authenticate, requireRole('Editor'), validate(statusSchema), updateStatus);
router.delete('/:id', authenticate, requireRole('Editor'), deleteArticle);
router.get('/:id/revisions', authenticate, requireRole('Editor'), getRevisions);

export default router;
