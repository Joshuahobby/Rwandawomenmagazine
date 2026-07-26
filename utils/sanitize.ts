import DOMPurify from 'dompurify';
import { ALLOWED_TAGS, ALLOWED_ATTR } from './sanitizePolicy';

/**
 * Browser-side sanitizer, applied at render.
 *
 * The server already sanitizes on write, so this is defence in depth — and the
 * part that neutralizes payloads stored before sanitization existed.
 *
 * Uses DOMPurify directly (not isomorphic-dompurify): this module is only ever
 * imported by React components, so a real DOM is always available and no jsdom
 * shim is needed. See utils/sanitizePolicy.ts for why that matters.
 */
export function sanitizeArticleHtml(dirty: string | null | undefined): string {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR });
}

export default sanitizeArticleHtml;
