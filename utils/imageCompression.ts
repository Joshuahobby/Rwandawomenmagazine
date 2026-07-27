/**
 * Downscales oversized images in the browser before they are uploaded.
 *
 * This is not just bandwidth politeness. The API runs as a Vercel serverless
 * function, and Vercel rejects request bodies over 4.5MB at the platform edge —
 * before Express, before multer, so the route's own 10MB limit never gets a say.
 * A photo straight off a phone is routinely 5-12MB, which means uploading one
 * failed in production no matter how the editor was wired.
 *
 * Compression is best-effort by design: if anything here fails, the original
 * File is returned and the upload proceeds. A slightly-too-large upload that
 * gets a clear error beats an image the author cannot insert at all.
 */

/** Comfortably under Vercel's 4.5MB body cap, leaving room for multipart framing. */
export const TARGET_MAX_BYTES = 3.5 * 1024 * 1024;

/** Beyond this, extra pixels do nothing for a magazine layout capped at ~1280px. */
export const TARGET_MAX_DIMENSION = 2400;

/**
 * Formats that must never go through the canvas:
 *  - GIF: canvas flattens it to a single frame, silently killing the animation.
 *  - SVG: vector; rasterising it throws away the whole point of the format.
 */
const PASS_THROUGH_TYPES = ['image/gif', 'image/svg+xml'];

export interface CompressionResult {
    file: File;
    /** True when the returned file differs from the input. */
    compressed: boolean;
    originalBytes: number;
    bytes: number;
}

/**
 * Decides whether a file is worth re-encoding, without touching the DOM.
 * Split out from the canvas work so the policy is testable on its own.
 */
export function shouldCompress(file: { type: string; size: number }): boolean {
    if (PASS_THROUGH_TYPES.includes(file.type.toLowerCase())) return false;
    if (!file.type.toLowerCase().startsWith('image/')) return false;
    return file.size > TARGET_MAX_BYTES;
}

/** Scale factor that brings the longest edge down to `max`, never upscaling. */
export function scaleToFit(width: number, height: number, max = TARGET_MAX_DIMENSION): number {
    const longest = Math.max(width, height);
    return longest > max ? max / longest : 1;
}

/**
 * Generous for decoding a large photo, but bounded. A decode that neither
 * resolves nor errors would otherwise leave the upload — and the author's
 * progress indicator — hanging forever.
 */
export const DECODE_TIMEOUT_MS = 8000;

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        const finish = (fn: () => void) => {
            clearTimeout(timer);
            URL.revokeObjectURL(url);
            fn();
        };
        const timer = setTimeout(
            () => finish(() => reject(new Error('Image decode timed out'))),
            DECODE_TIMEOUT_MS,
        );

        img.onload = () => finish(() => resolve(img));
        img.onerror = () => finish(() => reject(new Error('Could not decode image')));
        img.src = url;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

/**
 * Re-encodes an oversized image to fit the upload budget.
 *
 * Quality is stepped down rather than guessed once: a detailed photo and a flat
 * screenshot compress very differently, and a single fixed quality either
 * overshoots the budget or needlessly destroys the good case.
 */
export async function compressImage(file: File): Promise<CompressionResult> {
    const unchanged: CompressionResult = {
        file,
        compressed: false,
        originalBytes: file.size,
        bytes: file.size,
    };

    if (!shouldCompress(file)) return unchanged;
    if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return unchanged;

    try {
        const img = await loadImage(file);
        const scale = scaleToFit(img.naturalWidth, img.naturalHeight);

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

        const ctx = canvas.getContext('2d');
        if (!ctx) return unchanged;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // PNG screenshots re-encode far smaller as JPEG, and photos are JPEG
        // already. Transparency is the one thing worth keeping PNG for, and a
        // transparent image over 3.5MB is vanishingly rare.
        const outputType = 'image/jpeg';

        for (const quality of [0.85, 0.75, 0.65]) {
            const blob = await canvasToBlob(canvas, outputType, quality);
            if (!blob) return unchanged;
            if (blob.size <= TARGET_MAX_BYTES || quality === 0.65) {
                // Never hand back something bigger than what we were given.
                if (blob.size >= file.size) return unchanged;
                const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
                return {
                    file: new File([blob], name, { type: outputType, lastModified: file.lastModified }),
                    compressed: true,
                    originalBytes: file.size,
                    bytes: blob.size,
                };
            }
        }
        return unchanged;
    } catch {
        // Decode failures, tainted canvases, memory pressure — let the upload try.
        return unchanged;
    }
}
