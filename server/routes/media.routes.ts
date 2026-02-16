import { Router } from 'express';
import { uploadMedia, listMedia, deleteMedia } from '../controllers/media.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', authenticate, listMedia);
router.post('/', authenticate, requireRole('Author', 'Editor'), upload.single('file'), uploadMedia);
router.delete('/:id', authenticate, requireRole('Editor'), deleteMedia);

export default router;
