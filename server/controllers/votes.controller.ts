import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import crypto from 'crypto';
import prisma from '../config/db';
import { env } from '../config/env';
import { sendVoteNotification } from '../services/mail.service';

const TICKET_SECRET = env.JWT_SECRET || 'fallback-voting-secret';
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY || '';

// GET /api/votes/ticket — Issue a signed voting ticket
export const issueTicket = async (req: Request, res: Response) => {
    try {
        const voterIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

        // Sign a short-lived ticket (5 minutes)
        const ticket = jwt.sign(
            { ip: voterIp, iat: Math.floor(Date.now() / 1000) },
            TICKET_SECRET,
            { expiresIn: '5m' }
        );

        res.json({ ticket });
    } catch {
        res.status(500).json({ error: 'Failed to issue voting ticket' });
    }
};

// POST /api/votes — cast a vote (IP-limited: 1 vote per category per IP per 24h)
export const castVote = async (req: Request, res: Response) => {
    try {
        const { nominationId, fingerprint, ticket, recaptchaToken } = req.body;
        const voterIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

        if (!nominationId || !ticket) {
            res.status(400).json({ error: 'nominationId and security ticket are required' });
            return;
        }

        // Check if voting is open
        const votingStatus = await prisma.globalSetting.findUnique({ where: { key: 'VOTING_STATUS' } });
        if (votingStatus && votingStatus.value === 'closed') {
            res.status(403).json({ error: 'Voting is currently closed' });
            return;
        }

        // Honey-pot check: If bots fill this invisible field, we block them.
        if (req.body.hp_field) {
            console.warn(`[Security] Bot detected via honey-pot from IP: ${voterIp}`);
            res.status(204).end(); // Silent block
            return;
        }

        // 1. Verify Signed Ticket
        try {
            const decoded = jwt.verify(ticket, TICKET_SECRET) as { ip: string };
            if (decoded.ip !== voterIp) {
                res.status(403).json({ error: 'Invalid security ticket (IP mismatch)' });
                return;
            }
        } catch {
            res.status(403).json({ error: 'Session expired or invalid ticket. Please refresh.' });
            return;
        }

        // 2. Verify reCAPTCHA (if token provided and secret configured)
        if (RECAPTCHA_SECRET && recaptchaToken) {
            const verifyRes = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`);
            if (!verifyRes.data.success || verifyRes.data.score < 0.5) {
                res.status(403).json({ error: 'Bot activity detected. Please try again.' });
                return;
            }
        }

        // Make sure nomination exists and is approved/shortlisted/finalist
        const nomination = await prisma.nomination.findUnique({
            where: { id: nominationId },
            select: { status: true, categoryId: true, nomineeName: true },
        });

        if (!nomination) {
            res.status(404).json({ error: 'Nomination not found' });
            return;
        }

        if (!['approved', 'shortlisted', 'finalist'].includes(nomination.status)) {
            res.status(400).json({ error: 'This nominee is not eligible for voting' });
            return;
        }

        // 3. Race Condition Protection: Create a deterministic identity hash for this vote
        // hash(IP + Fingerprint + CategoryID + CurrentDateString)
        const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const idHash = crypto.createHash('sha256')
            .update(`${voterIp}|${fingerprint || 'unknown'}|${nomination.categoryId}|${dateStr}`)
            .digest('hex');

        const vote = await prisma.vote.create({
            data: {
                nominationId,
                voterIp,
                voterFingerprint: fingerprint || null,
                identityHash: idHash
            },
        });

        // Background notification - don't block the response
        sendVoteNotification(vote, nomination).catch(err => console.error('[Controller] Notification error:', err));

        res.status(201).json({ success: true, voteId: vote.id });
    } catch (err: unknown) {
        const error = err as { code?: string; message: string };
        // Handle unique constraint violation (fallback)
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'You have already voted in this category' });
            return;
        }
        console.error('Error casting vote:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
};

// GET /api/votes/results — get vote tallies grouped by category
export const getResults = async (_req: Request, res: Response) => {
    try {
        const categories = await prisma.awardCategory.findMany({
            orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
            include: {
                nominations: {
                    where: { status: { in: ['approved', 'shortlisted', 'finalist'] } },
                    include: {
                        _count: { select: { votes: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        const results = categories.map((cat) => ({
            categoryId: cat.id,
            categoryName: cat.name,
            categorySlug: cat.slug,
            group: cat.group,
            nominees: cat.nominations.map((n) => ({
                nominationId: n.id,
                nomineeName: n.nomineeName,
                nomineeOrganization: n.nomineeOrganization,
                sector: n.sector,
                votes: n._count.votes,
            })),
        }));

        res.json(results);
    } catch (err) {
        console.error('Error fetching results:', err);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
};

// GET /api/votes/results/:categoryId — detailed results for one category
export const getCategoryResults = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;

        const category = await prisma.awardCategory.findUnique({
            where: { id: Number(categoryId) },
            include: {
                nominations: {
                    where: { status: { in: ['approved', 'shortlisted', 'finalist'] } },
                    include: {
                        _count: { select: { votes: true } },
                    },
                },
            },
        });

        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }

        const totalVotes = category.nominations.reduce((sum, n) => sum + n._count.votes, 0);

        res.json({
            category: { id: category.id, name: category.name, group: category.group },
            totalVotes,
            nominees: category.nominations
                .map((n) => ({
                    nominationId: n.id,
                    nomineeName: n.nomineeName,
                    nomineeOrganization: n.nomineeOrganization,
                    sector: n.sector,
                    achievements: n.achievements,
                    votes: n._count.votes,
                    percentage: totalVotes > 0 ? Math.round((n._count.votes / totalVotes) * 100) : 0,
                }))
                .sort((a, b) => b.votes - a.votes),
        });
    } catch (err) {
        console.error('Error fetching category results:', err);
        res.status(500).json({ error: 'Failed to fetch category results' });
    }
};
