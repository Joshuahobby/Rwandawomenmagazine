
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import https from 'https';

const prisma = new PrismaClient();
const agent = new https.Agent({ rejectUnauthorized: false });
const BASE_URL = 'https://rwandawomenmagazine.rw';
const IMPORT_DIR = path.join(process.cwd(), 'public', 'uploads', 'imported');

if (!fs.existsSync(IMPORT_DIR)) {
    fs.mkdirSync(IMPORT_DIR, { recursive: true });
}

async function downloadImage(url: string, filename: string): Promise<string | null> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', httpsAgent: agent });
        const filePath = path.join(IMPORT_DIR, filename);
        fs.writeFileSync(filePath, response.data);
        return `/uploads/imported/${filename}`;
    } catch (error: any) {
        console.error(`Failed to download image ${url}:`, error.message);
        return null;
    }
}

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function scrape() {
    const admin = await prisma.user.findFirst({ where: { role: { name: 'Admin' } } });
    if (!admin) {
        console.error('No admin user found to assign articles to.');
        return;
    }
    console.log(`Using admin user: ${admin.email}`);

    // Create or find News category
    let category = await prisma.category.findFirst({ where: { name: 'News' } });
    if (!category) {
        console.log('Creating "News" category...');
        category = await prisma.category.create({ data: { name: 'News', slug: 'news' } });
    }

    // Iterate pages
    // Adjust range as needed.
    for (let page = 1; page <= 1; page++) {
        const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}/`;
        console.log(`Scraping page ${page}: ${url}`);

        try {
            const res = await axios.get(url, { httpsAgent: agent, headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(res.data);
            const linkSet = new Set<string>();

            // Extract article URLs (deduplicate — WordPress themes often have multiple links per article)
            $('h3 a').each((_, el) => {
                const href = $(el).attr('href');
                if (href) linkSet.add(href);
            });
            const articleLinks = Array.from(linkSet);

            console.log(`Found ${articleLinks.length} unique articles on page ${page}`);

            for (const link of articleLinks) {
                if (!link.includes('rwandawomenmagazine.rw')) continue;

                try {
                    console.log(`Processing: ${link}`);
                    const artRes = await axios.get(link, { httpsAgent: agent, headers: { 'User-Agent': 'Mozilla/5.0' } });
                    const $$ = cheerio.load(artRes.data);

                    const title = $$('h1.entry-title').first().text().trim();
                    if (!title) {
                        console.log('Skipping, no title found');
                        continue;
                    }

                    // Check duplicate
                    const existing = await prisma.article.findFirst({ where: { title } });
                    if (existing) {
                        console.log('Skipping, already exists');
                        continue;
                    }

                    const content = $$('.td-post-content').first().html() || '';
                    const dateStr = $$('.entry-date').first().text().trim();
                    // Parse date
                    let date = new Date(dateStr);
                    if (isNaN(date.getTime())) date = new Date();

                    const authorName = $$('.author').text().trim() || $$('.entry-author').text().trim() || 'RWM Editorial';


                    // Feature Image
                    const imgUrl = $$('article img').first().attr('src');

                    let featuredImagePath = null;
                    if (imgUrl) {
                        const ext = path.extname(imgUrl.split('?')[0]) || '.jpg';
                        const filename = `import-${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
                        const localPath = await downloadImage(imgUrl, filename);

                        if (localPath) {
                            featuredImagePath = localPath;
                            await prisma.media.create({
                                data: {
                                    filePath: localPath,
                                    fileName: filename,
                                    fileType: 'image',
                                    fileSize: 0,
                                    uploadedBy: admin.id
                                }
                            });
                        }
                    }

                    // Create Article
                    await prisma.article.create({
                        data: {
                            title,
                            slug: slugify(title) + '-' + Math.random().toString(36).substring(7),
                            content,
                            excerpt: $$('.td-post-content').text().substring(0, 150) + '...',
                            status: 'published',
                            isFeatured: false,
                            publishedAt: date,
                            createdAt: date,
                            authorId: admin.id,
                            categoryId: category.id,
                            featuredImage: featuredImagePath
                        }
                    });
                    console.log(`Created article: ${title}`);

                } catch (e: any) {
                    console.error(`Error processing article ${link}:`, e.message);
                }
            }

        } catch (e: any) {
            console.error(`Error scraping page ${page}:`, e.message);
        }
    }
}

scrape()
    .catch(async (e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
