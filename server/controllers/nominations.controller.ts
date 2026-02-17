import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/db';
import { NominationStatus } from '@prisma/client';
import { env } from '../config/env';

const TICKET_SECRET = env.JWT_SECRET || 'fallback-voting-secret';

// GET /api/nominations/categories — list all award categories grouped
export const getCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await prisma.awardCategory.findMany({
            orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
        });

        const grouped = {
            INDIVIDUAL: categories.filter((c) => c.group === 'INDIVIDUAL'),
            CORPORATE: categories.filter((c) => c.group === 'CORPORATE'),
            SME: categories.filter((c) => c.group === 'SME'),
        };

        res.json(grouped);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

// POST /api/nominations — submit a nomination
export const createNomination = async (req: Request, res: Response) => {
    try {
        const {
            categoryId,
            nomineeName,
            nomineeTitle,
            nomineeOrganization,
            sector,
            achievements,
            measurableResults,
            supportingDocUrl,
            nominatorName,
            nominatorEmail,
            nominatorPhone,
            ticket
        } = req.body;

        const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

        // Honey-pot check
        if (req.body.hp_field) {
            console.warn(`[Security] Bot detected via honey-pot from IP: ${clientIp}`);
            res.status(204).end(); // Silent block
            return;
        }

        // 1. Verify Signed Ticket
        try {
            const decoded = jwt.verify(ticket, TICKET_SECRET) as { ip: string };
            if (decoded.ip !== clientIp) {
                res.status(403).json({ error: 'Invalid security ticket (IP mismatch)' });
                return;
            }
        } catch {
            res.status(403).json({ error: 'Session expired or invalid ticket. Please refresh.' });
            return;
        }

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Limit: 1 nomination per IP per 24 hours to prevent spam
        const recentNomination = await prisma.nomination.findFirst({
            where: {
                categoryId: Number(categoryId),
                nominatorEmail: nominatorEmail,
                createdAt: { gte: twentyFourHoursAgo }
            }
        });

        if (recentNomination && recentNomination.nominatorEmail === nominatorEmail) {
            res.status(429).json({ error: 'You have already submitted a nomination in the last 24 hours' });
            return;
        }

        // High-End Hardening: Date-based identity hash to prevent race conditions
        const dateStr = new Date().toISOString().split('T')[0];
        const idHash = crypto.createHash('sha256')
            .update(`${clientIp}|${nominatorEmail}|${categoryId}|${dateStr}`)
            .digest('hex');

        const nomination = await prisma.nomination.create({
            data: {
                categoryId: Number(categoryId),
                nomineeName,
                nomineeTitle,
                nomineeOrganization,
                sector,
                achievements,
                measurableResults,
                supportingDocUrl,
                nominatorName,
                nominatorEmail,
                nominatorPhone,
                identityHash: idHash
            },
            include: { category: true },
        });

        res.status(201).json(nomination);
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
            res.status(429).json({ error: 'You have already submitted a nomination today' });
            return;
        }
        console.error('Error creating nomination:', err);
        res.status(500).json({ error: 'Failed to submit nomination' });
    }
};

// GET /api/nominations — list nominations, filter by categoryId & status
export const getNominations = async (req: Request, res: Response) => {
    try {
        const { categoryId, status } = req.query;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(1, Math.min(parseInt(req.query.limit as string) || 20, 100));
        const skip = (page - 1) * limit;

        interface NominationWhere {
            categoryId?: number;
            status?: NominationStatus;
        }
        const where: NominationWhere = {};
        if (categoryId && categoryId !== '') where.categoryId = Number(categoryId);
        if (status && status !== '') where.status = status as NominationStatus;

        const [nominations, total] = await Promise.all([
            prisma.nomination.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true, slug: true, group: true, icon: true } },
                    _count: { select: { votes: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.nomination.count({ where }),
        ]);

        res.json({ nominations, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err: unknown) {
        console.error('Error fetching nominations:', err);
        res.status(500).json({
            error: 'Failed to fetch nominations',
            details: (process.env.NODE_ENV === 'development' && err instanceof Error) ? err.message : undefined
        });
    }
};

// PATCH /api/nominations/:id/status — admin: update status
export const updateNominationStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'approved', 'shortlisted', 'finalist', 'rejected'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        const nomination = await prisma.nomination.update({
            where: { id: id as string },
            data: { status },
        });

        res.json(nomination);
    } catch (err) {
        console.error('Error updating nomination:', err);
        res.status(500).json({ error: 'Failed to update nomination' });
    }
};
