import { FilterXSS } from 'xss';
import { ALLOWED_TAGS, ALLOWED_ATTR, ALLOWED_SCHEMES } from '../../utils/sanitizePolicy';

/**
 * Server-side sanitizer, applied at the validation boundary on every write.
 *
 * Library choice is constrained by the deployment, not by preference: Vercel
 * bundles this API as CommonJS and its runtime cannot require() an ESM-only
 * module. Two attempts failed in production before this —
 * isomorphic-dompurify (drags in jsdom -> html-encoding-sniffer -> @exodus/bytes)
 * and sanitize-html (htmlparser2@12 is "type":"module") — each returning
 * ERR_REQUIRE_ESM on cold start, which took every API route down with
 * FUNCTION_INVOCATION_FAILED.
 *
 * Note that local `require()` does NOT catch this: Node 22.12+ supports
 * require-of-ESM, so it succeeds on a dev machine and fails on Vercel.
 * js-xss and its deps (commander, cssfilter) are all plain CommonJS.
 *
 * The allowlist is shared with the browser sanitizer (utils/sanitize.ts, which
 * uses DOMPurify against a real DOM) so the two cannot drift.
 */
const filter = new FilterXSS({
    whiteList: ALLOWED_TAGS.reduce<Record<string, string[]>>((acc, tag) => {
        acc[tag] = ALLOWED_ATTR;
        return acc;
    }, {}),
    // Drop disallowed tags entirely rather than escaping them into visible text.
    stripIgnoreTag: true,
    // Discard the *contents* of these too, so removed script/style bodies don't
    // resurface as page text.
    stripIgnoreTagBody: ['script', 'style', 'noscript', 'textarea', 'iframe'],
    // css: false leaves style attributes alone; the policy excludes `style`
    // from ALLOWED_ATTR anyway, so any style attribute is dropped before this.
    css: false,
    safeAttrValue(tag, name, value) {
        // js-xss already normalizes javascript: in href/src, but be explicit and
        // apply one scheme allowlist to every URL-bearing attribute.
        if (name === 'href' || name === 'src') {
            const trimmed = value.trim();
            if (!trimmed) return '';
            // Same-origin relative paths carry no scheme risk. '//host' is
            // protocol-relative and resolves to a different origin, so reject it.
            if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
            const scheme = trimmed.split(':')[0].toLowerCase();
            if (trimmed.includes(':') && !ALLOWED_SCHEMES.includes(scheme)) return '';
            if (!trimmed.includes(':')) return trimmed;
            return trimmed;
        }
        return value;
    },
});

export function sanitizeArticleHtml(dirty: string | null | undefined): string {
    if (!dirty) return '';
    return filter.process(dirty);
}

export default sanitizeArticleHtml;
