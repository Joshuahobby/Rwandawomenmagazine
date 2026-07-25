import DOMPurify from 'isomorphic-dompurify';

/**
 * Article bodies are authored in Quill and rendered with dangerouslySetInnerHTML,
 * so anything outside Quill's own output is an injection attempt rather than
 * authored content. This allowlist mirrors the editor's toolbar (see the
 * `modules` config in pages/Editor.tsx).
 *
 * Shared deliberately: the same list must apply on write (server) and on render
 * (client), otherwise content stored before sanitization existed still fires.
 */
const ALLOWED_TAGS = [
    'p', 'br', 'hr', 'span', 'div',
    'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
    'blockquote', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    // Quill's video button emits an iframe embed. Cross-origin iframes cannot
    // read this origin's localStorage, so this does not reopen token theft.
    'iframe',
];

const ALLOWED_ATTR = [
    'href', 'target', 'rel', 'title',
    'src', 'alt', 'width', 'height',
    // No `style`: DOMPurify passes CSS through untouched, which allows
    // url(javascript:...) and background-image exfiltration. The Editor's
    // toolbar has no colour/align buttons, so Quill emits classes, not styles.
    'class',
    'allow', 'allowfullscreen', 'frameborder',
    'colspan', 'rowspan',
];

/**
 * Strips scripts, event handlers and dangerous URL schemes from article HTML.
 * Returns a string in every case, including for null/undefined input.
 */
export function sanitizeArticleHtml(dirty: string | null | undefined): string {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR });
}

export default sanitizeArticleHtml;
