import { Request, Response } from 'express';
import prisma from '../config/db';

// Track a page view
export const trackView = async (req: Request, res: Response) => {
    try {
        const articleId = req.params.articleId as string;
        const ipAddress = (req.ip || req.headers['x-forwarded-for']) as string;
        const userAgent = req.headers['user-agent'];

        await prisma.articleView.create({
            data: { articleId, ipAddress, userAgent },
        });

        return res.status(201).json({ message: 'View recorded' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to record view' });
    }
};

// GET /api/analytics/dashboard — dashboard stats
export const getDashboardStats = async (_req: Request, res: Response) => {
    try {
        const [
            totalArticles,
            publishedArticles,
            pendingReview,
            totalViews,
            totalSubscribers,
            recentArticles,
        ] = await Promise.all([
            prisma.article.count(),
            prisma.article.count({ where: { status: 'published' } }),
            prisma.article.count({ where: { status: 'review' } }),
            prisma.articleView.count(),
            prisma.subscriber.count({ where: { isActive: true } }),
            prisma.article.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { fullName: true } },
                    category: { select: { name: true } },
                },
            }),
        ]);

        return res.json({
            totalArticles,
            publishedArticles,
            pendingReview,
            totalViews,
            totalSubscribers,
            recentArticles,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

// GET /api/analytics/views?period=7d|30d|90d
export const getViewStats = async (req: Request, res: Response) => {
    try {
        const period = (req.query.period as string) || '30d';
        const days = parseInt(period) || 30;
        const since = new Date();
        since.setDate(since.getDate() - days);

        // Get daily aggregate for chart
        const dailyViews = await prisma.$queryRaw`
            SELECT 
                DATE_TRUNC('day', viewed_at) as date,
                COUNT(*)::int as count
            FROM article_views
            WHERE viewed_at >= ${since}
            GROUP BY 1
            ORDER BY 1 ASC
        `;

        const views = await prisma.articleView.groupBy({
            by: ['articleId'],
            where: { viewedAt: { gte: since } },
            _count: true,
            orderBy: { _count: { articleId: 'desc' } },
            take: 10,
        });

        // Enrich with article titles
        const articleIds = views.map((v) => v.articleId);
        const articles = await prisma.article.findMany({
            where: { id: { in: articleIds } },
            select: { id: true, title: true, slug: true },
        });

        const enriched = views.map((v) => ({
            ...v,
            article: articles.find((a) => a.id === v.articleId),
        }));

        return res.json({ 
            period: `${days}d`, 
            topArticles: enriched,
            dailyViews 
        });
    } catch (error) {
        console.error('Failed to fetch view stats:', error);
        return res.status(500).json({ error: 'Failed to fetch view stats' });
    }
};
