import { Router } from 'express';
import { login, getMe, loginSchema } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginRateLimit } from '../middleware/rateLimit';

const router = Router();

// No public self-registration: accounts are created by an Admin via
// POST /api/users, which enforces role assignment and password strength.
router.post('/login', loginRateLimit, validate(loginSchema), login);
router.get('/me', authenticate, getMe);

export default router;
