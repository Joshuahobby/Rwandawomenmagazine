import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { generateSlug } from '../services/slug';

export const categorySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const listCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { articles: true } } },
        });
        return res.json(categories);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, description, color } = req.body;
        const slug = generateSlug(name);

        const category = await prisma.category.create({
            data: { name, slug, description, color },
        });
        return res.status(201).json(category);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to create category' });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, description, color } = req.body;
        const data: any = {};
        if (name) { data.name = name; data.slug = generateSlug(name); }
        if (description !== undefined) data.description = description;
        if (color) data.color = color;

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data,
        });
        return res.json(category);
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to update category' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        await prisma.category.delete({ where: { id: parseInt(req.params.id as string) } });
        return res.json({ message: 'Category deleted' });
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to delete category' });
    }
};
