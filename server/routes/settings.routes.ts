import { Router } from 'express';
import { getSettings, updateSetting, sendTestEmail } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Settings routes
router.get('/', (req, res, next) => {
    console.log('[SettingsRoute] GET / hit');
    getSettings(req, res).catch(next);
});

router.post('/', authenticate, (req, res, next) => {
    console.log('[SettingsRoute] POST / hit');
    updateSetting(req, res).catch(next);
});

router.patch('/', authenticate, (req, res, next) => {
    console.log('[SettingsRoute] PATCH / hit');
    updateSetting(req, res).catch(next);
});

router.post('/test-email', authenticate, (req, res, next) => {
    console.log('[SettingsRoute] POST /test-email hit');
    sendTestEmail(req, res).catch(next);
});

export default router;
