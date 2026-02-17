import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { Prisma, ArticleStatus } from '@prisma/client';
import { generateSlug } from '../services/slug';

export const createArticleSchema = z.object({
    title: z.string().min(1).max(300),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    featuredImage: z.string().optional(),
    categoryId: z.number().int().positive(),
    isFeatured: z.boolean().optional(),
    tags: z.array(z.number().int()).optional(),
    seo: z.object({
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImage: z.string().optional(),
        keywords: z.string().optional(),
    }).optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

export const statusSchema = z.object({
    status: z.enum(['draft', 'review', 'published', 'archived']),
});

// GET /api/articles — public, paginated, filterable
export const listArticles = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.max(1, Math.min(parseInt(req.query.limit as string) || 12, 50));
        const skip = (page - 1) * limit;
        console.log(`[API] listArticles: page=${page}, limit=${limit}, category=${req.query.category}`);
        const categorySlug = req.query.category as string;
        const tagSlug = req.query.tag as string;
        const featured = req.query.featured === 'true';
        const status = (req.query.status as string) || 'published';
        const search = req.query.search as string;

        const where: Prisma.ArticleWhereInput = { status: status as ArticleStatus };
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

        return res.json({
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
        });
    } catch (error) {
        console.error('List articles error detail:', error);
        return res.status(500).json({
            error: 'Failed to fetch articles',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

// GET /api/articles/id/:id
export const getArticleById = async (req: Request, res: Response) => {
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

        return res.json({
            ...article,
            tags: article.tags.map((t) => t.tag),
        });
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to fetch article' });
    }
};

// GET /api/articles/:slug
export const getArticle = async (req: Request, res: Response) => {
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
        const slug = generateSlug(title);

        // Check slug uniqueness
        const existing = await prisma.article.findUnique({ where: { slug } });
        if (existing) {
            return res.status(409).json({ error: 'An article with a similar title already exists' });
        }

        const articleData: Prisma.ArticleCreateInput = {
            title,
            slug,
            excerpt,
            content,
            featuredImage,
            category: { connect: { id: categoryId } },
            author: { connect: { id: req.user!.id } },
            isFeatured: isFeatured || false,
            tags: tags?.length
                ? { create: tags.map((tagId: number) => ({ tag: { connect: { id: tagId } } })) }
                : undefined,
            seoMeta: seo
                ? { create: seo }
                : undefined,
        };

        if (req.body.status === 'published') {
            articleData.status = 'published';
            articleData.publishedAt = new Date();
        }

        const article = await prisma.article.create({
            data: articleData,
            include: { category: true, author: { select: { id: true, fullName: true } }, tags: { include: { tag: true } } },
        });

        return res.status(201).json({
            ...article,
            tags: article.tags.map((t) => t.tag),
        });
    } catch (error) {
        console.error('Create article error:', error);
        return res.status(500).json({ error: 'Failed to create article' });
    }
};

// PUT /api/articles/:id
export const updateArticle = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title, excerpt, content, featuredImage, categoryId, isFeatured, tags, seo } = req.body;

        const existing = await prisma.article.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Save revision before updating
        if (existing.content) {
            await prisma.articleRevision.create({
                data: {
                    articleId: id,
                    editorId: req.user!.id,
                    contentSnapshot: existing.content,
                },
            });
        }

        const updateData: Prisma.ArticleUpdateInput = {};
        if (title) {
            updateData.title = title;
            updateData.slug = generateSlug(title);
        }
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (content !== undefined) updateData.content = content;
        if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
        if (categoryId) updateData.category = { connect: { id: categoryId } };
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

        // Update tags
        if (tags) {
            await prisma.articleTag.deleteMany({ where: { articleId: id } });
            await prisma.articleTag.createMany({
                data: tags.map((tagId: number) => ({ articleId: id, tagId })),
            });
        }

        // Update SEO
        if (seo) {
            await prisma.seoMeta.upsert({
                where: { articleId: id },
                update: seo,
                create: { articleId: id, ...seo },
            });
        }

        const article = await prisma.article.update({
            where: { id },
            data: updateData,
            include: { category: true, author: { select: { id: true, fullName: true } }, tags: { include: { tag: true } } },
        });

        return res.json({
            ...article,
            tags: article.tags.map((t) => t.tag),
        });
    } catch (error) {
        console.error('Update article error:', error);
        return res.status(500).json({ error: 'Failed to update article' });
    }
};

// PATCH /api/articles/:id/status
export const updateStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;

        const updateData: Prisma.ArticleUpdateInput = { status };
        if (status === 'published') {
            updateData.publishedAt = new Date();
        }

        const article = await prisma.article.update({
            where: { id },
            data: updateData,
        });

        return res.json(article);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to update status' });
    }
};

// DELETE /api/articles/:id
export const deleteArticle = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.article.update({
            where: { id },
            data: { status: 'archived' },
        });
        return res.json({ message: 'Article archived' });
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to archive article' });
    }
};

// GET /api/articles/:id/revisions
export const getRevisions = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const revisions = await prisma.articleRevision.findMany({
            where: { articleId: id },
            orderBy: { createdAt: 'desc' },
            include: { editor: { select: { id: true, fullName: true } } },
        });
        return res.json(revisions);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to fetch revisions' });
    }
};
