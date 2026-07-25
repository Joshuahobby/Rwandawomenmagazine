import { z } from 'zod';

/**
 * An optional URL field that is either empty (no image set) or an absolute
 * http(s) URL. Blocks `javascript:`, `data:`, `vbscript:` and similar schemes
 * from reaching an `<img src>` / `<meta property="og:image">` — these values
 * are attacker-controlled (article featured image, SEO og:image) and render
 * unsanitized.
 */
export const optionalHttpUrl = z.string().trim().refine((value) => {
    if (!value) return true;
    // A root-relative path (e.g. "/uploads/x.jpg", written by prisma/seed-scraper.ts
    // for locally-downloaded images) is same-origin by construction and carries
    // none of the javascript:/data: risk an absolute scheme does. "//host/x" is
    // protocol-relative and resolves to a DIFFERENT origin, so it's excluded.
    if (value.startsWith('/') && !value.startsWith('//')) return true;
    try {
        return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}, { message: 'Must be empty, a same-origin path, or a valid http(s) URL' }).optional();
