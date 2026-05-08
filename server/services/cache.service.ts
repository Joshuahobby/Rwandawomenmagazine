import NodeCache from 'node-cache';

// Initialize cache with 5 minutes default TTL and 10 minutes check period
const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

export const cacheKeys = {
    ARTICLES_LIST: 'articles_list',
    ARTICLE_BY_SLUG: (slug: string) => `article_${slug}`,
    CATEGORIES_LIST: 'categories_list',
};

export const getCache = <T>(key: string): T | undefined => {
    return cache.get<T>(key);
};

export const setCache = <T>(key: string, value: T, ttl?: number): boolean => {
    return cache.set(key, value, ttl || 300);
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
