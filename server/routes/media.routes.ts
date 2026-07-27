import { Router } from 'express';
import { uploadMedia, listMedia, deleteMedia } from '../controllers/media.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { uploadSingleFile } from '../middleware/upload';

const router = Router();

router.get('/', authenticate, listMedia);
router.post('/', authenticate, requireRole('Author', 'Editor'), uploadSingleFile('file'), uploadMedia);
router.delete('/:id', authenticate, requireRole('Editor'), deleteMedia);

export default router;
