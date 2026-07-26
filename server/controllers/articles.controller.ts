import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { Prisma, ArticleStatus } from '@prisma/client';
import { generateSlug, generateUniqueSlug } from '../services/slug';
import { getCache, setCache, clearCache } from '../services/cache.service';
import { sendPrismaError } from '../services/errors';
import { sanitizeArticleHtml } from '../services/sanitize';
import { optionalHttpUrl } from '../services/validators';

const ARTICLE_STATUSES = ['draft', 'review', 'published', 'archived'] as const;

// Moving an article into a publicly visible (or retired) state is an Editor action.
// Authors may only park work in draft or push it to review.
const PRIVILEGED_STATUSES: readonly string[] = ['published', 'archived'];

const canSetStatus = (role: string | undefined, status: ArticleStatus): boolean =>
    !PRIVILEGED_STATUSES.includes(status) || role === 'Editor' || role === 'Admin';

/** Editorial staff may read and manage work that is not publicly visible. */
const isStaff = (role: string | undefined): boolean =>
    role === 'Editor' || role === 'Admin';

/**
 * Anyone signed in may see unpublished work; anonymous visitors get the
 * published site only. Without this the status filter is caller-controlled on
 * a public route, which exposes every draft.
 */
const canReadUnpublished = (req: AuthRequest): boolean => Boolean(req.user);

/** Authors own their drafts; editors and admins may act on anything. */
const canModifyArticle = (req: AuthRequest, authorId: string): boolean =>
    isStaff(req.user?.role) || req.user?.id === authorId;

/**
 * Slug-collision predicate for generateUniqueSlug. `exceptId` keeps an article
 * from colliding with itself when its own title is re-saved.
 */
const isSlugTaken = (exceptId?: string) => async (slug: string): Promise<boolean> => {
    const match = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(match) && match!.id !== exceptId;
};

export const createArticleSchema = z.object({
    title: z.string().min(1).max(300),
    excerpt: z.string().optional(),
    // Sanitize at the validation boundary so every write path (create and the
    // .partial() update schema below) stores clean HTML — the body is later
    // rendered with dangerouslySetInnerHTML.
    content: z.string().transform(sanitizeArticleHtml).optional(),
    featuredImage: optionalHttpUrl,
    categoryId: z.number().int().positive(),
    isFeatured: z.boolean().optional(),
    status: z.enum(ARTICLE_STATUSES).optional(),
    tags: z.array(z.number().int()).optional(),
    seo: z.object({
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImage: optionalHttpUrl,
        keywords: z.string().optional(),
    }).optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

export const statusSchema = z.object({
    status: z.enum(ARTICLE_STATUSES),
});

// GET /api/articles — public, paginated, filterable
export const listArticles = async (req: AuthRequest, res: Response) => {
    try {
        // Clamp page as well as limit: a negative page yields a negative skip,
        // which Prisma rejects outright.
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(1, Math.min(parseInt(req.query.limit as string) || 12, 50));
        const skip = (page - 1) * limit;
        const categorySlug = req.query.category as string;
        const tagSlug = req.query.tag as string;
        const featured = req.query.featured === 'true';
        // An absent/blank status means "the public view"; 'all' is the explicit
        // opt-out used by the dashboard. Anything else must be a real enum member —
        // an unchecked cast here reaches Prisma and throws.
        const status = ((req.query.status as string) || '').trim() || 'published';
        if (status !== 'all' && !ARTICLE_STATUSES.includes(status as ArticleStatus)) {
            return res.status(400).json({
                error: `Invalid status filter. Expected one of: ${[...ARTICLE_STATUSES, 'all'].join(', ')}`,
            });
        }
        if (status !== 'published' && !canReadUnpublished(req)) {
            return res.status(401).json({
                error: 'Sign in to list articles that are not published',
            });
        }
        const search = req.query.search as string;

        // Generate a cache key based on query parameters. Only the anonymous
        // 'published' view is ever cached (see the setCache guard below), so no
        // key here can serve unpublished content to a later caller.
        const cacheKey = `articles_list_p${page}_l${limit}_c${categorySlug || ''}_t${tagSlug || ''}_f${featured}_s${status}_q${search || ''}`;
        
        // Searches are not cached (unbounded key space), and neither is any
        // non-published view — those are per-caller and must not be replayed to
        // whoever asks next.
        const isCacheable = !search && status === 'published';

        const cachedResponse = isCacheable
            ? getCache<{ articles: any[], pagination: any }>(cacheKey)
            : undefined;
        if (cachedResponse) {
            console.log(`[CACHE] Serving articles list from cache: ${cacheKey}`);
            return res.json(cachedResponse);
        }

        console.log(`[API] listArticles: Fetching from DB for key: ${cacheKey}`);

        // 'all' is the dashboard's working view: everything still in play,
        // excluding archived. Archived stays reachable via ?status=archived.
        const where: Prisma.ArticleWhereInput =
            status === 'all'
                ? { status: { in: ['draft', 'review', 'published'] } }
                : { status: status as ArticleStatus };
        if (categorySlug) where.category = { slug: categorySlug };
        if (featured) where.isFeatured = true;
        if (tagSlug) where.tags = { some: { tag: { slug: tagSlug } } };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: { select: { id: true, name: true, slug: true, color: true } },
                    author: { select: { id: true, fullName: true, profileImage: true } },
                    tags: { include: { tag: true } },
                },
            }),
            prisma.article.count({ where }),
        ]);

        const responseData = {
            articles: articles.map((a) => ({
                ...a,
                tags: a.tags?.map((t: { tag: { id: number; name: string; slug: string } }) => t.tag) || [],
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };

        // Cache the public view for 5 minutes
        if (isCacheable) {
            setCache(cacheKey, responseData);
        }

        return res.json(responseData);
    } catch (error) {
        console.error('List articles error detail:', error);
        return res.status(500).json({
            error: 'Failed to fetch articles',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

// GET /api/articles/id/:id
export const getArticleById = async (req: AuthRequest, res: Response) => {
    try {
        const article = await prisma.article.findUnique({
            where: { id: req.params.id as string },
            include: {
                category: true,
                author: { select: { id: true, fullName: true, bio: true, profileImage: true } },
                tags: { include: { tag: true } },
                seoMeta: true,
            },
        });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Unpublished work is staff-only. 404 rather than 403 so the existence of
        // an embargoed article is not confirmed to an anonymous caller.
        if (article.status !== 'published' && !canReadUnpublished(req)) {
            return res.status(404).json({ error: 'Article not found' });
        }

        return res.json({
            ...article,
            tags: article.tags.map((t) => t.tag),
        });
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to fetch article' });
    }
};

// GET /api/articles/:slug
export const getArticle = async (req: AuthRequest, res: Response) => {
    try {
        const article = await prisma.article.findUnique({
            where: { slug: req.params.slug as string },
            include: {
                category: true,
                author: { select: { id: true, fullName: true, bio: true, profileImage: true } },
                tags: { include: { tag: true } },
                seoMeta: true,
            },
        });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Slugs are derived from titles and therefore guessable — an archived or
        // draft article must not stay readable at its public URL.
        if (article.status !== 'published' && !canReadUnpublished(req)) {
            return res.status(404).json({ error: 'Article not found' });
        }

        return res.json({
            ...article,
            tags: article.tags.map((t) => t.tag),
        });
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to fetch article' });
    }
};

// POST /api/articles
export const createArticle = async (req: AuthRequest, res: Response) => {
    try {
        const { title, excerpt, content, featuredImage, categoryId, isFeatured, tags, seo } = req.body;
        const status: ArticleStatus = req.body.status || 'draft';

        if (!canSetStatus(req.user?.role, status)) {
            return res.status(403).json({
                error: 'Only Editors can publish or archive articles. Save as a draft or submit for review instead.',
            });
        }

        const slug = await generateUniqueSlug(title, isSlugTaken());

        const articleData: Prisma.ArticleCreateInput = {
            title,
            slug,
            excerpt,
            content,
            featuredImage,
            category: { connect: { id: categoryId } },
            author: { connect: { id: req.user!.id } },
            isFeatured: isFeatured || false,
            status,
            publishedAt: status === 'published' ? new Date() : null,
            tags: tags?.length
                ? { create: tags.map((tagId: number) => ({ tag: { connect: { id: tagId } } })) }
                : undefined,
            seoMeta: seo
                ? { create: seo }
                : undefined,
        };

        const article = await prisma.article.create({
            data: articleData,
            include: { category: true, author: { select: { id: true, fullName: true } }, tags: { include: { tag: true } } },
        });

        // Invalidate article lists on create
        clearCache();

        return res.status(201).json({
            ...article,
            tags: article.tags.map((t) => t.tag),
        });
    } catch (error) {
        return sendPrismaError(res, error, {
            conflict: 'An article with a similar title already exists',
            badReference: 'The selected category or tag no longer exists',
            notFound: 'The selected category or tag no longer exists',
            fallback: 'Failed to create article',
        });
    }
};

// PUT /api/articles/:id
export const updateArticle = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title, excerpt, content, featuredImage, categoryId, isFeatured, status, tags, seo } = req.body;

        const existing = await prisma.article.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Article not found' });
        }

        if (!canModifyArticle(req, existing.authorId)) {
            return res.status(403).json({ error: 'You can only edit your own articles' });
        }

        if (status && status !== existing.status && !canSetStatus(req.user?.role, status)) {
            return res.status(403).json({
                error: 'Only Editors can publish or archive articles. Save as a draft or submit for review instead.',
            });
        }

        const updateData: Prisma.ArticleUpdateInput = {};
        if (title) {
            updateData.title = title;
            // Once an article has been published its URL is public and may be
            // linked or indexed, so the slug is frozen; retitling a draft still
            // refreshes it.
            if (!existing.publishedAt && generateSlug(title) !== existing.slug) {
                updateData.slug = await generateUniqueSlug(title, isSlugTaken(id));
            }
        }
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (content !== undefined) updateData.content = content;
        if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
        if (categoryId) updateData.category = { connect: { id: categoryId } };
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
        if (status && status !== existing.status) {
            updateData.status = status;
            // Stamp the publication date once, on the first transition into
            // published — re-publishing after an edit must not reset it.
            if (status === 'published' && !existing.publishedAt) {
                updateData.publishedAt = new Date();
            }
        }

        // One logical edit = one transaction. Run as a batch (not an interactive
        // transaction) so it stays a single round trip and is safe through
        // PgBouncer. Order matters: the array executes sequentially, and the
        // article update is last so its result is the response.
        const operations: Prisma.PrismaPromise<unknown>[] = [];

        // Snapshot the outgoing content before it is overwritten.
        if (existing.content) {
            operations.push(prisma.articleRevision.create({
                data: {
                    articleId: id,
                    editorId: req.user!.id,
                    contentSnapshot: existing.content,
                },
            }));
        }

        if (tags) {
            operations.push(prisma.articleTag.deleteMany({ where: { articleId: id } }));
            operations.push(prisma.articleTag.createMany({
                data: tags.map((tagId: number) => ({ articleId: id, tagId })),
            }));
        }

        if (seo) {
            operations.push(prisma.seoMeta.upsert({
                where: { articleId: id },
                update: seo,
                create: { articleId: id, ...seo },
            }));
        }

        operations.push(prisma.article.update({
            where: { id },
            data: updateData,
            include: { category: true, author: { select: { id: true, fullName: true } }, tags: { include: { tag: true } } },
        }));

        const results = await prisma.$transaction(operations);
        const article = results[results.length - 1] as Prisma.ArticleGetPayload<{
            include: { category: true; author: { select: { id: true; fullName: true } }; tags: { include: { tag: true } } };
        }>;

        // Invalidate specific article and list
        clearCache();

        return res.json({
            ...article,
            tags: article.tags.map((t) => t.tag),
        });
    } catch (error) {
        return sendPrismaError(res, error, {
            conflict: 'An article with a similar title already exists',
            notFound: 'Article not found',
            badReference: 'The selected category or tag no longer exists',
            fallback: 'Failed to update article',
        });
    }
};

// PATCH /api/articles/:id/status
export const updateStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;

        const existing = await prisma.article.findUnique({
            where: { id },
            select: { publishedAt: true },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Article not found' });
        }

        const updateData: Prisma.ArticleUpdateInput = { status };
        // Same rule as updateArticle: first publish wins, later ones keep the date.
        if (status === 'published' && !existing.publishedAt) {
            updateData.publishedAt = new Date();
        }

        const article = await prisma.article.update({
            where: { id },
            data: updateData,
        });

        clearCache();

        return res.json(article);
    } catch (error) {
        return sendPrismaError(res, error, {
            notFound: 'Article not found',
            fallback: 'Failed to update status',
        });
    }
};

// DELETE /api/articles/:id
export const deleteArticle = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        const existing = await prisma.article.findUnique({
            where: { id },
            select: { authorId: true },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Article not found' });
        }
        if (!canModifyArticle(req, existing.authorId)) {
            return res.status(403).json({ error: 'You can only archive your own articles' });
        }

        await prisma.article.update({
            where: { id },
            data: { status: 'archived' },
        });

        clearCache();

        return res.json({ message: 'Article archived' });
    } catch (error) {
        return sendPrismaError(res, error, {
            notFound: 'Article not found',
            fallback: 'Failed to archive article',
        });
    }
};

// GET /api/articles/:id/revisions
export const getRevisions = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        const existing = await prisma.article.findUnique({
            where: { id },
            select: { authorId: true },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Article not found' });
        }
        // Revisions contain prior drafts of the body, so they follow the same
        // ownership rule as editing.
        if (!canModifyArticle(req, existing.authorId)) {
            return res.status(403).json({ error: 'You can only view revisions of your own articles' });
        }

        const revisions = await prisma.articleRevision.findMany({
            where: { articleId: id },
            orderBy: { createdAt: 'desc' },
            include: { editor: { select: { id: true, fullName: true } } },
        });
        return res.json(revisions);
    } catch (error) {
        return sendPrismaError(res, error, { fallback: 'Failed to fetch revisions' });
    }
};
