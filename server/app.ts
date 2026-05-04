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

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging for debugging routing
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve uploaded files - point to the public directory where they now reside
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public/uploads')));

// Serve static files from the React app (dist)
app.use(express.static(path.join(__dirname, '../dist')));

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

// Catch-all for API: If it's an /api request that didn't match, return 404
app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// For any other non-API request, the Vercel edge handles the index.html fallback.
// This local handler is for development fallback.
app.use((_req, res) => {
    if (process.env.NODE_ENV === 'production') {
        // In production, Vercel edge should have handled this. 
        // If we get here, it's a truly missing file.
        res.status(404).send('Not Found');
    } else {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
});

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
