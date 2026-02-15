import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';

export const subscriberSchema = z.object({
    email: z.string().email(),
    source: z.string().optional(),
});

export const subscribe = async (req: Request, res: Response) => {
    try {
        const { email, source } = req.body;

        const existing = await prisma.subscriber.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Already subscribed' });
        }

        const subscriber = await prisma.subscriber.create({
            data: { email, source: source || 'website' },
        });
        return res.status(201).json({ message: 'Subscribed successfully', id: subscriber.id });
    } catch (error) {
        return res.status(500).json({ error: 'Subscription failed' });
    }
};

export const listSubscribers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

        const [subscribers, total] = await Promise.all([
            prisma.subscriber.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.subscriber.count(),
        ]);

        return res.json({ subscribers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
};

export const unsubscribe = async (req: Request, res: Response) => {
    try {
        await prisma.subscriber.update({
            where: { id: req.params.id as string },
            data: { isActive: false },
        });
        return res.json({ message: 'Unsubscribed' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to unsubscribe' });
    }
};
