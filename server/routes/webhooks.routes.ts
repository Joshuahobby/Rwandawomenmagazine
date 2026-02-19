import { Router } from 'express';
import { handleResendWebhook } from '../controllers/webhooks.controller';

const router = Router();

// Resend webhooks endpoint
router.post('/resend', handleResendWebhook);

export default router;
