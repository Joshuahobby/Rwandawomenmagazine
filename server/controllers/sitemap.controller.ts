import { Request, Response } from 'express';
import prisma from '../config/db';

export const generateSitemap = async (_req: Request, res: Response) => {
    try {
        const baseUrl = 'https://rwandawomenmagazine.rw';

        // Fetch all published articles
        const articles = await prisma.article.findMany({
            where: { status: 'published' },
            select: { slug: true, updatedAt: true }
        });

        // Fetch all categories
        const categories = await prisma.category.findMany({
            select: { slug: true }
        });

        // Static pages
        const staticPages = [
            '',
            '/about',
            '/contact',
            '/newsletter',
            '/awards',
            '/partners',
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static pages
        staticPages.forEach(page => {
            xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // Add categories
        categories.forEach(cat => {
            xml += `
  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        // Add articles
        articles.forEach(article => {
            xml += `
  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${article.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`;
        });

        xml += '\n</urlset>';

        res.header('Content-Type', 'application/xml');
        return res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return res.status(500).send('Error generating sitemap');
    }
};
