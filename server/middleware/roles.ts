import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

type RoleName = 'Admin' | 'Editor' | 'Author' | 'Contributor';

const ROLE_HIERARCHY: Record<RoleName, number> = {
    Admin: 4,
    Editor: 3,
    Author: 2,
    Contributor: 1,
};

/**
 * Require at least the given role level.
 * E.g. requireRole('Editor') allows Editor and Admin.
 */
export const requireRole = (...allowedRoles: RoleName[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role as RoleName;
        if (!allowedRoles.includes(userRole) && userRole !== 'Admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};
