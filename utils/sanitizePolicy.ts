/**
 * The single source of truth for what article HTML may contain.
 *
 * Article bodies are authored in Quill and rendered with dangerouslySetInnerHTML,
 * so anything outside Quill's own output is an injection attempt rather than
 * authored content. This list mirrors the editor's toolbar (see the `modules`
 * config in pages/Editor.tsx).
 *
 * Two engines consume this policy, deliberately:
 *  - the browser uses DOMPurify (utils/sanitize.ts), which needs a real DOM;
 *  - the server uses sanitize-html (server/services/sanitize.ts), which is
 *    pure JS. The server must NOT pull in a DOM shim: isomorphic-dompurify
 *    drags jsdom into the Vercel function bundle, and jsdom's
 *    html-encoding-sniffer requires an ESM-only package that a CommonJS
 *    serverless bundle cannot require() — that took the whole API down.
 *
 * Keeping the allowlist here means the two engines can never drift apart.
 */
export const ALLOWED_TAGS = [
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

/**
 * Note the absence of `style`: both engines pass CSS through largely untouched,
 * which allows url(javascript:...) and background-image exfiltration. The
 * Editor's toolbar has no colour/align buttons, so Quill emits classes here,
 * not inline styles.
 */
export const ALLOWED_ATTR = [
    'href', 'target', 'rel', 'title',
    'src', 'alt', 'width', 'height',
    'class',
    'allow', 'allowfullscreen', 'frameborder',
    'colspan', 'rowspan',
];

/** Schemes permitted in href/src. Everything else (javascript:, vbscript:) is dropped. */
export const ALLOWED_SCHEMES = ['http', 'https', 'mailto', 'tel'];
