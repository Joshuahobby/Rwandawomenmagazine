import slugifyLib from 'slugify';

/** Used when a title slugifies to nothing (emoji, punctuation or CJK-only titles). */
const FALLBACK_SLUG = 'article';

export function generateSlug(text: string): string {
    return slugifyLib(text, {
        lower: true,
        strict: true,
        trim: true,
    });
}

/**
 * Produces a slug that is safe to write to a unique column.
 *
 * Two problems `generateSlug` alone does not solve:
 *  - strict mode strips every non-transliterable character, so a title like
 *    "🎉🎉🎉" or "???" yields "", which is unroutable and collides with the
 *    next such title;
 *  - a plain slug collides with any existing article sharing the title.
 *
 * `isTaken` is supplied by the caller so this stays model-agnostic and can
 * exclude the row being updated.
 */
export async function generateUniqueSlug(
    text: string,
    isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
    const base = generateSlug(text) || FALLBACK_SLUG;

    if (!(await isTaken(base))) return base;

    // Bounded rather than while(true): if a title has 100 variants, something is
    // wrong and a 409 is a better answer than an unbounded query loop.
    for (let suffix = 2; suffix <= 100; suffix++) {
        const candidate = `${base}-${suffix}`;
        if (!(await isTaken(candidate))) return candidate;
    }

    throw new Error(`Could not derive a unique slug from "${text}"`);
}
