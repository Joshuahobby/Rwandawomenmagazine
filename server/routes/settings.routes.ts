import { Router } from 'express';
import { getSettings, updateSetting, sendTestEmail } from '../controllers/settings.controller';

const router = Router();

// Settings routes
router.get('/', getSettings);
router.post('/', updateSetting);
router.post('/test-email', sendTestEmail);

export default router;
