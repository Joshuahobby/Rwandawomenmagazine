import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user || !user.isActive) {
            console.warn(`[Auth] Login failed: User not found or inactive (${email})`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            console.warn(`[Auth] Login failed: Password mismatch (${email})`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id }, env.JWT_SECRET as jwt.Secret, {
            expiresIn: env.JWT_EXPIRES_IN as any,
        });

        console.log(`[Auth] Login successful: ${email}`);

        return res.json({
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role.name,
                profileImage: user.profileImage,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            include: { role: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role.name,
            bio: user.bio,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
        });
    } catch (_error) {
        // Silently fail or log with underscore
        return res.status(500).json({ error: 'Failed to get profile' });
    }
};
