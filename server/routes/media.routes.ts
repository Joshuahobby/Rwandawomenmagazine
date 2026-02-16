import { Router } from 'express';
import { uploadMedia, listMedia, deleteMedia } from '../controllers/media.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', authenticate, listMedia);
router.post('/', authenticate, requireRole('Author', 'Editor'), upload.single('file'), uploadMedia);
router.delete('/:id', authenticate, requireRole('Editor'), deleteMedia);

export default router;
