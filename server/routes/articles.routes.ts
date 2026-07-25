import { Router } from 'express';
import {
    listArticles, getArticleById, getArticle, createArticle, updateArticle,
    updateStatus, deleteArticle, getRevisions,
    createArticleSchema, updateArticleSchema, statusSchema,
} from '../controllers/articles.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// Public, but optionalAuthenticate lets signed-in staff see unpublished work.
// Anonymous callers get the published site only (enforced in the controllers).
router.get('/', optionalAuthenticate, listArticles);
router.get('/id/:id', optionalAuthenticate, getArticleById);
router.get('/:slug', optionalAuthenticate, getArticle);

// Auth required
router.post('/', authenticate, requireRole('Author', 'Editor'), validate(createArticleSchema), createArticle);
router.put('/:id', authenticate, requireRole('Author', 'Editor'), validate(updateArticleSchema), updateArticle);
router.patch('/:id/status', authenticate, requireRole('Editor'), validate(statusSchema), updateStatus);
router.delete('/:id', authenticate, requireRole('Editor'), deleteArticle);
router.get('/:id/revisions', authenticate, requireRole('Editor'), getRevisions);

export default router;
