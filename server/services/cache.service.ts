import NodeCache from 'node-cache';

// This cache lives in one Node process. On Vercel each warm serverless
// instance holds its own copy, so a write's clearCache() only clears the
// instance that served that write — other instances keep answering from their
// own copy until it expires on its own. stdTTL is therefore the real bound on
// how stale a published change can look to a reader routed to a different
// instance, not just a performance knob.
//
// Fixing this properly means a shared store (Redis/Upstash) or CDN
// cache-control with tag invalidation. Absent that infrastructure, this TTL
// is kept short deliberately — tight enough that the staleness window is
// barely perceptible, while still absorbing bursts of identical reads.
const STALENESS_BOUND_SECONDS = 30;
const cache = new NodeCache({ stdTTL: STALENESS_BOUND_SECONDS, checkperiod: 60 });

export const cacheKeys = {
    ARTICLES_LIST: 'articles_list',
    ARTICLE_BY_SLUG: (slug: string) => `article_${slug}`,
    CATEGORIES_LIST: 'categories_list',
};

export const getCache = <T>(key: string): T | undefined => {
    return cache.get<T>(key);
};

export const setCache = <T>(key: string, value: T, ttl?: number): boolean => {
    // A per-call ttl always overrides node-cache's constructor stdTTL, so this
    // fallback must track STALENESS_BOUND_SECONDS explicitly — hardcoding a
    // longer value here would silently defeat the bound set above.
    return cache.set(key, value, ttl ?? STALENESS_BOUND_SECONDS);
};

export const invalidateCache = (key: string | string[]): void => {
    if (Array.isArray(key)) {
        key.forEach(k => cache.del(k));
    } else {
        cache.del(key);
    }
};

export const clearCache = (): void => {
    cache.flushAll();
};

export default cache;
