import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

export const registerSchema = z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6),
    roleId: z.number().int().positive().optional(),
    bio: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, roleId, bio } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Default to Author role (id: 3) if not specified
        const assignedRoleId = roleId || 3;
        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { fullName, email, passwordHash, roleId: assignedRoleId, bio },
            include: { role: true },
        });

        const token = jwt.sign({ userId: user.id }, env.JWT_SECRET as jwt.Secret, {
            expiresIn: env.JWT_EXPIRES_IN as any,
        });

        return res.status(201).json({
            user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role.name },
            token,
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, env.JWT_SECRET as jwt.Secret, {
            expiresIn: env.JWT_EXPIRES_IN as any,
        });

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
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get profile' });
    }
};
