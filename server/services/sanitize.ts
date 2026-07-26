import sanitizeHtmlLib from 'sanitize-html';
import { ALLOWED_TAGS, ALLOWED_ATTR, ALLOWED_SCHEMES } from '../../utils/sanitizePolicy';

/**
 * Server-side sanitizer, applied at the validation boundary on every write.
 *
 * Uses sanitize-html rather than DOMPurify because it is pure JS and needs no
 * DOM. A DOM shim here (isomorphic-dompurify -> jsdom) breaks the Vercel
 * serverless bundle outright — see utils/sanitizePolicy.ts.
 *
 * The allowlist is shared with the browser sanitizer so the two cannot drift.
 */
export function sanitizeArticleHtml(dirty: string | null | undefined): string {
    if (!dirty) return '';

    return sanitizeHtmlLib(dirty, {
        allowedTags: ALLOWED_TAGS,
        // sanitize-html keys attributes per tag; '*' applies the list to all.
        allowedAttributes: { '*': ALLOWED_ATTR },
        allowedSchemes: ALLOWED_SCHEMES,
        // Without this, a scheme-relative //evil.com/x resolves to another origin.
        allowProtocolRelative: false,
        // Drop the contents of removed script/style tags rather than leaking
        // their text into the output as plain text.
        nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript'],
    });
}

export default sanitizeArticleHtml;
