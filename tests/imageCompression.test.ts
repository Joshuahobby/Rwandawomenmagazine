import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    shouldCompress,
    scaleToFit,
    compressImage,
    TARGET_MAX_BYTES,
    TARGET_MAX_DIMENSION,
    DECODE_TIMEOUT_MS,
} from '../utils/imageCompression';

const file = (type: string, size: number, name = 'photo.jpg') => {
    const f = new File([new Uint8Array(1)], name, { type });
    // Size cannot be set through the constructor without allocating the bytes.
    Object.defineProperty(f, 'size', { value: size });
    return f;
};

const MB = 1024 * 1024;

describe('shouldCompress', () => {
    it('compresses an oversized photo', () => {
        expect(shouldCompress(file('image/jpeg', 8 * MB))).toBe(true);
    });

    it('leaves a file already under the budget alone', () => {
        expect(shouldCompress(file('image/jpeg', 400 * 1024))).toBe(false);
        expect(shouldCompress(file('image/png', TARGET_MAX_BYTES))).toBe(false);
    });

    it.each([
        // Canvas would flatten a GIF to one frame and rasterise an SVG.
        ['image/gif', 'animation is lost'],
        ['image/svg+xml', 'vectors would be rasterised'],
    ])('never touches %s (%s)', (type) => {
        expect(shouldCompress(file(type, 9 * MB))).toBe(false);
    });

    it('ignores non-images', () => {
        expect(shouldCompress(file('application/pdf', 9 * MB))).toBe(false);
    });
});

describe('scaleToFit', () => {
    it('shrinks the longest edge to the cap', () => {
        expect(scaleToFit(6000, 4000)).toBeCloseTo(TARGET_MAX_DIMENSION / 6000);
        expect(scaleToFit(1000, 8000)).toBeCloseTo(TARGET_MAX_DIMENSION / 8000);
    });

    it('never upscales a small image', () => {
        expect(scaleToFit(800, 600)).toBe(1);
        expect(scaleToFit(TARGET_MAX_DIMENSION, 100)).toBe(1);
    });
});

describe('compressImage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returns the original untouched when nothing needs doing', async () => {
        const small = file('image/jpeg', 100 * 1024);
        const result = await compressImage(small);
        expect(result.file).toBe(small);
        expect(result.compressed).toBe(false);
    });

    it('falls back to the original when the image cannot be decoded', async () => {
        // Same path a corrupt file takes in a real browser.
        vi.spyOn(window, 'Image').mockImplementation(function (this: HTMLImageElement) {
            setTimeout(() => this.onerror?.(new Event('error')), 0);
            return this;
        } as unknown as typeof Image);

        const big = file('image/jpeg', 9 * MB);
        const result = await compressImage(big);

        expect(result.file).toBe(big);
        expect(result.compressed).toBe(false);
        expect(result.originalBytes).toBe(9 * MB);
    });

    it('gives up rather than hanging when a decode never settles', async () => {
        // An <img> that fires neither load nor error would otherwise leave the
        // upload — and the author's progress indicator — stuck indefinitely.
        vi.useFakeTimers();
        vi.spyOn(window, 'Image').mockImplementation(function (this: HTMLImageElement) {
            return this;
        } as unknown as typeof Image);

        const big = file('image/jpeg', 9 * MB);
        const pending = compressImage(big);
        await vi.advanceTimersByTimeAsync(DECODE_TIMEOUT_MS + 100);

        await expect(pending).resolves.toMatchObject({ file: big, compressed: false });
        vi.useRealTimers();
    });
});
