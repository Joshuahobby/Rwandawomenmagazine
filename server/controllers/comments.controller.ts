import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';

export const commentSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    comment: z.string().min(1),
});

export const createComment = async (req: Request, res: Response) => {
    try {
        const { name, email, comment } = req.body;
        const articleId = req.params.articleId as string;

        const article = await prisma.article.findUnique({ where: { id: articleId } });
        if (!article) return res.status(404).json({ error: 'Article not found' });

        const newComment = await prisma.comment.create({
            data: { articleId, name, email, comment },
        });
        return res.status(201).json(newComment);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to post comment' });
    }
};

export const listComments = async (req: Request, res: Response) => {
    try {
        const { articleId } = req.params;
        const approvedOnly = req.query.approved === 'true';

        const where: any = {};
        if (articleId) where.articleId = articleId;
        if (approvedOnly) where.isApproved = true;

        const comments = await prisma.comment.findMany({
            where,
            include: {
                article: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(comments);
    } catch (error) {
        console.error('List comments error:', error);
        return res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

export const approveComment = async (req: Request, res: Response) => {
    try {
        const comment = await prisma.comment.update({
            where: { id: req.params.id as string },
            data: { isApproved: true },
        });
        return res.json(comment);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to approve comment' });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        await prisma.comment.delete({ where: { id: req.params.id as string } });
        return res.json({ message: 'Comment deleted' });
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to delete comment' });
    }
};
