const WORDS_PER_MINUTE = 200;

/**
 * Estimates how long an article takes to read, from its raw HTML content.
 * Tags are stripped before counting so markup never inflates the total.
 *
 * @param html The article's HTML content
 * @returns Whole minutes, never less than 1
 */
export const readingTimeMinutes = (html: string | null | undefined): number => {
    if (!html) return 1;

    const text = html
        .replace(/<[^>]*>/g, ' ')   // drop tags
        .replace(/&[a-z]+;/gi, ' ') // drop entities
        .trim();

    if (!text) return 1;

    const words = text.split(/\s+/).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};
