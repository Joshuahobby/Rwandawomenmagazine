import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/db';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

/**
 * Populates req.user when a valid token is present, but never rejects.
 * Used on public read routes that must stay open to anonymous visitors while
 * still recognising staff — e.g. so only editors can list unpublished work.
 */
export const optionalAuthenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId?: string };
        if (!decoded.userId) return next();

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true },
        });

        if (user && user.isActive) {
            req.user = { id: user.id, email: user.email, role: user.role.name };
        }
    } catch {
        // An invalid or expired token on a public route is treated as anonymous,
        // not as an error — the caller is still entitled to the public view.
    }

    return next();
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Split into two phases so a database outage can't masquerade as a bad
    // token. Previously both lived in one try/catch, so a Neon connection
    // hiccup returned the same 401 as an invalid token — and the frontend's
    // axios interceptor clears stored credentials on any 401, logging out
    // every active editor mid-draft on a transient DB blip.
    let decoded: { userId: string };
    try {
        const token = authHeader.split(' ')[1];
        decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    } catch (_error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid or inactive user' });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role.name,
        };

        next();
    } catch (error) {
        console.error('Auth lookup failed:', error);
        return res.status(503).json({ error: 'Authentication temporarily unavailable, please retry' });
    }
};
