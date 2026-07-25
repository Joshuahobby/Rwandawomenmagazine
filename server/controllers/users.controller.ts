import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';

export const listUsers = async (_req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, fullName: true, email: true, bio: true,
                profileImage: true, isActive: true, createdAt: true,
                role: { select: { id: true, name: true } },
                _count: { select: { articles: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(users);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { fullName, email, bio, profileImage, roleId, isActive, password } = req.body;

        const data: any = {};
        if (fullName) data.fullName = fullName;
        if (email) {
            const existing = await prisma.user.findFirst({
                where: { email, NOT: { id: String(id) } }
            });
            if (existing) return res.status(409).json({ error: 'Email already in use' });
            data.email = email;
        }
        if (bio !== undefined) data.bio = bio;
        if (profileImage !== undefined) data.profileImage = profileImage;
        if (roleId) data.roleId = Number(roleId);
        if (isActive !== undefined) data.isActive = isActive;

        if (password) {
            if (!isStrongPassword(password)) {
                return res.status(400).json({
                    error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
                });
            }
            data.passwordHash = await bcrypt.hash(password, 12);
        }

        const user = await prisma.user.update({
            where: { id: String(id) },
            data,
            include: { role: true },
        });

        return res.json({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            bio: user.bio,
            _count: { articles: await prisma.article.count({ where: { authorId: user.id } }) }
        });
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to update user' });
    }
};

export const listRoles = async (_req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany({
            orderBy: { name: 'asc' },
        });
        return res.json(roles);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to fetch roles' });
    }
};

const isStrongPassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, roleId, bio } = req.body;

        if (password && !isStrongPassword(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
            });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password || 'RWM2026!', 12);
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                passwordHash,
                roleId: Number(roleId),
                bio,
                isActive: true
            },
            include: { role: true },
        });

        return res.status(201).json({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            _count: { articles: 0 }
        });
    } catch (error) {
        console.error('Create user error:', error);
        return res.status(500).json({ error: 'Failed to create user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const userId = id as string;

        // Prevent deleting the last admin or yourself could be added here
        // For now, simple delete
        await prisma.user.delete({
            where: { id: userId }
        });

        return res.status(204).send();
    } catch (error) {
        console.error('Delete user error:', error);
        return res.status(500).json({ error: 'Failed to delete user' });
    }
};
