import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { generateSlug } from '../services/slug';

export const tagSchema = z.object({
    name: z.string().min(1).max(50),
});

export const listTags = async (_req: Request, res: Response) => {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { articles: true } } },
        });
        return res.json(tags);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to fetch tags' });
    }
};

export const createTag = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const slug = generateSlug(name);
        const tag = await prisma.tag.create({ data: { name, slug } });
        return res.status(201).json(tag);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to create tag' });
    }
};

export const deleteTag = async (req: Request, res: Response) => {
    try {
        await prisma.tag.delete({ where: { id: parseInt(req.params.id as string) } });
        return res.json({ message: 'Tag deleted' });
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to delete tag' });
    }
};
