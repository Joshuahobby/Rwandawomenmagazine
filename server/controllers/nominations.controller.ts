import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/db';
import { NominationStatus, CategoryGroup } from '@prisma/client';
import { env } from '../config/env';
import { sendNominationNotification, NominationNotification } from '../services/mail.service';
import { generateSlug } from '../services/slug';

const TICKET_SECRET = env.JWT_SECRET || 'fallback-voting-secret';

// --- Award Category CRUD ---

// POST /api/nominations/categories — admin: create category
export const createAwardCategory = async (req: Request, res: Response) => {
    try {
        const { name, description, criteria, icon, group, sortOrder } = req.body;
        const slug = generateSlug(name);

        const category = await prisma.awardCategory.create({
            data: {
                name,
                slug,
                description,
                criteria,
                icon: icon || 'emoji_events',
                group: group as CategoryGroup || 'INDIVIDUAL',
                sortOrder: sortOrder ? Number(sortOrder) : 0,
            },
        });
        res.status(201).json(category);
    } catch (err) {
        console.error('Error creating award category:', err);
        res.status(500).json({ error: 'Failed to create award category' });
    }
};

// PATCH /api/nominations/categories/:id — admin: update category
export const updateAwardCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, criteria, icon, group, sortOrder } = req.body;

        const data: any = {};
        if (name) {
            data.name = name;
            data.slug = generateSlug(name);
        }
        if (description !== undefined) data.description = description;
        if (criteria !== undefined) data.criteria = criteria;
        if (icon) data.icon = icon;
        if (group) data.group = group as CategoryGroup;
        if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

        const category = await prisma.awardCategory.update({
            where: { id: Number(id) },
            data,
        });
        res.json(category);
    } catch (err) {
        console.error('Error updating award category:', err);
        res.status(500).json({ error: 'Failed to update award category' });
    }
};

// DELETE /api/nominations/categories/:id — admin: delete category
export const deleteAwardCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.awardCategory.delete({ where: { id: Number(id) } });
        res.json({ message: 'Award category deleted' });
    } catch (err) {
        console.error('Error deleting award category:', err);
        res.status(500).json({ error: 'Failed to delete award category' });
    }
};

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

// --- Nomination CRUD ---

// POST /api/nominations — submit a nomination (public)
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
        const xForwardedFor = req.headers['x-forwarded-for'];
        const clientIp = req.ip || (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor) || 'unknown';

        // Check if nominations are open
        const nominationStatus = await prisma.globalSetting.findUnique({ where: { key: 'NOMINATION_STATUS' } });
        if (nominationStatus && nominationStatus.value === 'closed') {
            res.status(403).json({ error: 'Nominations are currently closed' });
            return;
        }

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
                nomineeTitle: nomineeTitle || null,
                nomineeOrganization: nomineeOrganization || null,
                sector: sector || null,
                achievements: achievements || null,
                measurableResults: measurableResults || null,
                supportingDocUrl: supportingDocUrl || null,
                nominatorName,
                nominatorEmail,
                nominatorPhone: nominatorPhone || null,
                identityHash: idHash
            },
            include: { category: true },
        });

        // Background notification - convert nulls to undefined for the notification service
        const notificationData: NominationNotification = {
            ...nomination,
            nomineeTitle: nomination.nomineeTitle || undefined,
            nomineeOrganization: nomination.nomineeOrganization || undefined,
            sector: nomination.sector || undefined,
            supportingDocUrl: nomination.supportingDocUrl || undefined,
            nominatorPhone: nomination.nominatorPhone || undefined,
        };
        sendNominationNotification(notificationData).catch(err => console.error('[Controller] Notification error:', err));

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

// POST /api/nominations/admin — admin: create nomination directly
export const createNominationAdmin = async (req: Request, res: Response) => {
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
            status,
            manualVotes
        } = req.body;

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
                nominatorName: nominatorName || 'Admin',
                nominatorEmail: nominatorEmail || 'admin@rwandawomenmagazine.com',
                nominatorPhone,
                status: status as NominationStatus || 'approved',
                manualVotes: manualVotes ? Number(manualVotes) : 0,
            },
            include: { category: true },
        });

        res.status(201).json(nomination);
    } catch (err) {
        console.error('Error creating nomination admin:', err);
        res.status(500).json({ error: 'Failed to create nomination' });
    }
};

// GET /api/nominations — list nominations, filter by categoryId & status
export const getNominations = async (req: Request, res: Response) => {
    try {
        const { categoryId, status } = req.query;
        const pageStr = req.query.page;
        const limitStr = req.query.limit;
        const page = Math.max(1, parseInt(Array.isArray(pageStr) ? pageStr[0] as string : pageStr as string) || 1);
        const limit = Math.max(1, Math.min(parseInt(Array.isArray(limitStr) ? limitStr[0] as string : limitStr as string) || 20, 100));
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

// PATCH /api/nominations/:id — admin: update nomination
export const updateNomination = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            categoryId,
            nomineeName,
            nomineeTitle,
            nomineeOrganization,
            sector,
            achievements,
            measurableResults,
            supportingDocUrl,
            status,
            manualVotes
        } = req.body;

        const data: any = {};
        if (categoryId) data.categoryId = Number(categoryId);
        if (nomineeName) data.nomineeName = nomineeName;
        if (nomineeTitle !== undefined) data.nomineeTitle = nomineeTitle;
        if (nomineeOrganization !== undefined) data.nomineeOrganization = nomineeOrganization;
        if (sector !== undefined) data.sector = sector;
        if (achievements !== undefined) data.achievements = achievements;
        if (measurableResults !== undefined) data.measurableResults = measurableResults;
        if (supportingDocUrl !== undefined) data.supportingDocUrl = supportingDocUrl;
        if (status) data.status = status as NominationStatus;
        if (manualVotes !== undefined) data.manualVotes = Number(manualVotes);

        const nomination = await prisma.nomination.update({
            where: { id: id as string },
            data,
        });

        res.json(nomination);
    } catch (err) {
        console.error('Error updating nomination:', err);
        res.status(500).json({ error: 'Failed to update nomination' });
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

// DELETE /api/nominations/:id — admin: delete nomination
export const deleteNomination = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.nomination.delete({ where: { id: id as string } });
        res.json({ message: 'Nomination deleted' });
    } catch (err) {
        console.error('Error deleting nomination:', err);
        res.status(500).json({ error: 'Failed to delete nomination' });
    }
};

// PATCH /api/nominations/bulk-status — admin: bulk update status
export const bulkUpdateNominationStatus = async (req: Request, res: Response) => {
    try {
        const { ids, status } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ error: 'Missing or empty ids array' });
            return;
        }

        const validStatuses = ['pending', 'approved', 'shortlisted', 'finalist', 'rejected'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        const result = await prisma.nomination.updateMany({
            where: { id: { in: ids } },
            data: { status: status as NominationStatus },
        });

        res.json({ message: `Successfully updated ${result.count} nominations`, count: result.count });
    } catch (err) {
        console.error('Error bulk updating nominations:', err);
        res.status(500).json({ error: 'Failed to bulk update nominations' });
    }
};
