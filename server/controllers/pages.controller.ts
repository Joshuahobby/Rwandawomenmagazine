import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { generateSlug } from '../services/slug';

export const pageSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().optional(),
    publishedAt: z.string().datetime().optional(),
});

export const listPages = async (_req: Request, res: Response) => {
    try {
        const pages = await prisma.page.findMany({ orderBy: { createdAt: 'desc' } });
        return res.json(pages);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch pages' });
    }
};

export const getPage = async (req: Request, res: Response) => {
    try {
        const page = await prisma.page.findUnique({ where: { slug: req.params.slug as string } });
        if (!page) return res.status(404).json({ error: 'Page not found' });
        return res.json(page);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch page' });
    }
};

export const createPage = async (req: Request, res: Response) => {
    try {
        const { title, content, publishedAt } = req.body;
        const slug = generateSlug(title);
        const page = await prisma.page.create({
            data: { title, slug, content, publishedAt: publishedAt ? new Date(publishedAt) : null },
        });
        return res.status(201).json(page);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create page' });
    }
};

export const updatePage = async (req: Request, res: Response) => {
    try {
        const { title, content, publishedAt } = req.body;
        const data: any = {};
        if (title) { data.title = title; data.slug = generateSlug(title); }
        if (content !== undefined) data.content = content;
        if (publishedAt !== undefined) data.publishedAt = publishedAt ? new Date(publishedAt) : null;

        const page = await prisma.page.update({ where: { id: req.params.id as string }, data });
        return res.json(page);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update page' });
    }
};

export const deletePage = async (req: Request, res: Response) => {
    try {
        await prisma.page.delete({ where: { id: req.params.id as string } });
        return res.json({ message: 'Page deleted' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete page' });
    }
};
