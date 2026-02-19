import { Router } from 'express';
import { getSettings, updateSetting, sendTestEmail } from '../controllers/settings.controller';

const router = Router();

// Settings routes
router.get('/', (req, res, next) => {
    console.log('[SettingsRoute] GET / hit');
    getSettings(req, res).catch(next);
});

router.post('/', (req, res, next) => {
    console.log('[SettingsRoute] POST / hit');
    updateSetting(req, res).catch(next);
});

router.patch('/', (req, res, next) => {
    console.log('[SettingsRoute] PATCH / hit');
    updateSetting(req, res).catch(next);
});

router.post('/test-email', (req, res, next) => {
    console.log('[SettingsRoute] POST /test-email hit');
    sendTestEmail(req, res).catch(next);
});

export default router;
