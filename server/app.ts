import express from 'express';
import cors from 'cors';
import path from 'path';
import prisma from './config/db';

// Route imports
import authRoutes from './routes/auth.routes';
import articlesRoutes from './routes/articles.routes';
import categoriesRoutes from './routes/categories.routes';
import tagsRoutes from './routes/tags.routes';
import mediaRoutes from './routes/media.routes';
import usersRoutes from './routes/users.routes';
import pagesRoutes from './routes/pages.routes';
import subscribersRoutes from './routes/subscribers.routes';
import commentsRoutes from './routes/comments.routes';
import analyticsRoutes from './routes/analytics.routes';
import nominationsRoutes from './routes/nominations.routes';
import votesRoutes from './routes/votes.routes';
import webhooksRoutes from './routes/webhooks.routes';
import settingsRoutes from './routes/settings.routes';
import { generateSitemap } from './controllers/sitemap.controller';
import { initMonitoring, setupErrorHandler } from './services/monitoring.service';

initMonitoring();

const app = express();

// Trust Vercel's single reverse-proxy hop so req.ip resolves the real client
// IP from X-Forwarded-For, not Vercel's own internal edge address. Without
// this, req.ip is never falsy, so the "|| x-forwarded-for" fallbacks in
// fraud.middleware.ts and votes.controller.ts never actually run — every
// voter would resolve to the same internal IP, breaking both fraud detection
// and vote-dedup identity hashing. Harmless locally: with no proxy in front,
// req.ip still falls back to the direct socket address.
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging for debugging routing
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - OriginalUrl: ${req.originalUrl} - Path: ${req.path}`);
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/nominations', nominationsRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/settings', settingsRoutes);

// Serve uploaded files - point to the public directory where they now reside
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public/uploads')));

// Sitemap
app.get('/sitemap.xml', generateSitemap);

// Serve static files from the React app (dist)
app.use(express.static(path.join(__dirname, '../dist')));

// Health check
app.get('/api/health', async (_req, res) => {
    try {
        console.log('[Health] Checking database connection...');
        await prisma.$queryRaw`SELECT 1`;
        console.log('[Health] Database connected.');
        res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('[Health] Database connection failed:', error);
        res.status(503).json({
            status: 'error',
            database: 'disconnected',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Debug DB
app.get('/api/debug-db', async (_req, res) => {
    try {
        const total = await prisma.article.count();
        const published = await prisma.article.count({ where: { status: 'published' } });
        res.json({ total, published });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// Catch-all for API: If it's an /api request that didn't match, return 404
app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// For any other non-API request, send back React's index.html file.
app.get('*', (req, res) => {
    // If it's an API request that reached here, it means it didn't match any route
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    const indexPath = path.join(__dirname, '../dist/index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(404).send('Not Found');
        }
    });
});

// Sentry error handler (must be before custom error handler)
setupErrorHandler(app);

// Error handler — Express requires all 4 args to identify this as an error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    void _next; // Explicitly acknowledging _next
    console.error('Unhandled error at:', req.url);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        path: req.url
    });
});

export default app;
