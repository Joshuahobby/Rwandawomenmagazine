import rateLimit from 'express-rate-limit';

/**
 * Login has no other defense against credential stuffing — bcrypt makes each
 * guess expensive, but nothing previously capped guess *rate*. Keyed on IP,
 * which is what's available without adding session state before a session
 * exists.
 */
export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again in a few minutes.' },
});
