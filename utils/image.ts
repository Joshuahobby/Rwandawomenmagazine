/**
 * Optimizes a Cloudinary image URL by adding automatic format and quality flags.
 * Defaults to WebP/AVIF if supported by the browser.
 * 
 * @param url The original Cloudinary URL
 * @param width Optional width transformation
 * @param height Optional height transformation
 * @returns Optimized URL string
 */
export const optimizeImage = (url: string | null | undefined, width?: number, height?: number): string => {
    if (!url) return "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop";
    
    // Only transform Cloudinary URLs
    if (!url.includes('cloudinary.com')) return url;

    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const transformations = ['f_auto', 'q_auto'];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (width && height) transformations.push('c_fill'); // Fill center if both dimensions provided

    return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
};

/** Candidate widths for responsive article imagery, phone through 4K. */
export const RESPONSIVE_WIDTHS = [480, 768, 1024, 1440, 1920, 2560];

/**
 * Builds a `srcSet` string so the browser can pick the cheapest image that fits.
 * Non-Cloudinary URLs yield the same href at every width, which is harmless —
 * the browser simply reuses one candidate.
 *
 * @param url The original image URL
 * @param widths Candidate widths in pixels
 * @returns A `srcSet` value, or undefined when there is no URL to transform
 */
export const buildSrcSet = (
    url: string | null | undefined,
    widths: number[] = RESPONSIVE_WIDTHS
): string | undefined => {
    if (!url || !url.includes('cloudinary.com')) return undefined;
    return widths.map((w) => `${optimizeImage(url, w)} ${w}w`).join(', ');
};
