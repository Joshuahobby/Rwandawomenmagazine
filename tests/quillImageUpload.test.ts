import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeArticleHtml as sanitizeOnServer } from '../server/services/sanitize';
import { sanitizeArticleHtml as sanitizeInBrowser } from '../utils/sanitize';
import {
    dataUriToFile,
    isDataUri,
    uploadDataUriImages,
    uploadEditorImage,
    uploadErrorMessage,
} from '../utils/quillImageUpload';

const post = vi.fn();
vi.mock('../services/api', () => ({
    default: {
        post: (...args: unknown[]) => post(...args),
    },
}));

// A 1x1 transparent PNG.
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const PNG_DATA_URI = `data:image/png;base64,${PNG_BASE64}`;

beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({ data: { filePath: 'https://res.cloudinary.com/demo/image/upload/uploaded.png' } });
});

// The reason this module exists: the write-side sanitizer has no `data:` in its
// scheme allowlist, so a base64 image Quill embeds survives in the editor and is
// gutted the moment the article is saved. Pin both halves of that.
describe('why inline images must be uploaded', () => {
    it('the server sanitizer strips a base64 image src on write', () => {
        const out = sanitizeOnServer(`<p><img src="${PNG_DATA_URI}"></p>`);
        expect(out).not.toContain('base64');
        expect(out).toMatch(/<img src\s*(=""|)\s*\/?>/);
    });

    it('but keeps an uploaded https image, in both engines', () => {
        const html = '<img src="https://res.cloudinary.com/demo/image/upload/x.jpg" alt="a">';
        for (const sanitize of [sanitizeOnServer, sanitizeInBrowser]) {
            expect(sanitize(html).replace(/\s*\/>/g, '>')).toBe(html);
        }
    });
});

describe('isDataUri', () => {
    it.each([
        [PNG_DATA_URI, true],
        ['  data:image/png;base64,AAAA', true],
        ['https://res.cloudinary.com/x.jpg', false],
        ['/uploads/x.jpg', false],
        ['', false],
        [null, false],
    ])('%s -> %s', (src, expected) => {
        expect(isDataUri(src)).toBe(expected);
    });
});

describe('dataUriToFile', () => {
    it('decodes a base64 image into a File the upload endpoint will accept', () => {
        const file = dataUriToFile(PNG_DATA_URI, 'pasted-image-1');
        expect(file).not.toBeNull();
        // The API derives the file type from the extension, so it must be right.
        expect(file!.name).toBe('pasted-image-1.png');
        expect(file!.type).toBe('image/png');
        expect(file!.size).toBe(atob(PNG_BASE64).length);
    });

    it('maps image/jpeg to a .jpg name rather than .jpeg', () => {
        expect(dataUriToFile('data:image/jpeg;base64,AAAA', 'x')!.name).toBe('x.jpg');
    });

    it('tolerates the line breaks a pasted attribute can carry', () => {
        const wrapped = `data:image/png;base64,${PNG_BASE64.slice(0, 20)}\n  ${PNG_BASE64.slice(20)}`;
        const file = dataUriToFile(wrapped, 'x');
        expect(file!.size).toBe(atob(PNG_BASE64).length);
    });

    it('handles a percent-encoded (non-base64) data URI', () => {
        const file = dataUriToFile('data:image/svg+xml,%3Csvg%3E%3C%2Fsvg%3E', 'x');
        expect(file!.name).toBe('x.svg');
        expect(file!.size).toBe('<svg></svg>'.length);
    });

    it.each([
        ['not a data uri', 'https://example.com/x.jpg'],
        ['a non-image payload', 'data:text/html;base64,PHNjcmlwdD4='],
        ['undecodable base64', 'data:image/png;base64,@@@@'],
    ])('returns null for %s', (_label, input) => {
        expect(dataUriToFile(input, 'x')).toBeNull();
    });
});

describe('uploadEditorImage', () => {
    it('returns the Cloudinary URL the API reports', async () => {
        const file = new File([new Uint8Array([1, 2, 3])], 'a.png', { type: 'image/png' });
        await expect(uploadEditorImage(file)).resolves.toBe(
            'https://res.cloudinary.com/demo/image/upload/uploaded.png',
        );
        expect(post).toHaveBeenCalledOnce();
    });

    it('rejects an oversized file without spending a round trip', async () => {
        const huge = new File([new Uint8Array(11 * 1024 * 1024)], 'big.png', { type: 'image/png' });
        await expect(uploadEditorImage(huge)).rejects.toThrow(/limit is 10MB/);
        expect(post).not.toHaveBeenCalled();
    });

    it('fails loudly when the API returns no URL', async () => {
        post.mockResolvedValue({ data: {} });
        const file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' });
        await expect(uploadEditorImage(file)).rejects.toThrow(/no image URL/);
    });
});

describe('uploadDataUriImages', () => {
    it('leaves content without embedded images byte-for-byte untouched', async () => {
        const html = '<p>Hello <strong>world</strong></p><img src="https://res.cloudinary.com/x.jpg">';
        const result = await uploadDataUriImages(html);
        expect(result.html).toBe(html);
        expect(result.uploaded).toBe(0);
        expect(post).not.toHaveBeenCalled();
    });

    it.each([[''], [null], [undefined]])('handles empty content (%s)', async (input) => {
        await expect(uploadDataUriImages(input)).resolves.toEqual({ html: '', uploaded: 0 });
    });

    it('replaces an embedded image with its uploaded URL', async () => {
        const { html, uploaded } = await uploadDataUriImages(`<p>intro</p><p><img src="${PNG_DATA_URI}"></p>`);
        expect(uploaded).toBe(1);
        expect(html).not.toContain('base64');
        expect(html).toContain('src="https://res.cloudinary.com/demo/image/upload/uploaded.png"');
        expect(html).toContain('<p>intro</p>');
    });

    it('survives the sanitizer it previously died in', async () => {
        const { html } = await uploadDataUriImages(`<p><img src="${PNG_DATA_URI}"></p>`);
        expect(sanitizeOnServer(html)).toContain('uploaded.png');
    });

    it('uploads a repeated image once', async () => {
        post.mockResolvedValueOnce({ data: { filePath: 'https://cdn/one.png' } });
        const { html, uploaded } = await uploadDataUriImages(
            `<img src="${PNG_DATA_URI}"><p>x</p><img src="${PNG_DATA_URI}">`,
        );
        expect(post).toHaveBeenCalledOnce();
        expect(uploaded).toBe(1);
        expect(html.match(/https:\/\/cdn\/one\.png/g)).toHaveLength(2);
    });

    it('keeps already-hosted images alongside the ones it uploads', async () => {
        const { html } = await uploadDataUriImages(
            `<img src="https://res.cloudinary.com/keep.jpg"><img src="${PNG_DATA_URI}">`,
        );
        expect(html).toContain('https://res.cloudinary.com/keep.jpg');
        expect(html).toContain('uploaded.png');
    });

    it('propagates an upload failure instead of dropping the image', async () => {
        post.mockRejectedValue({ response: { data: { error: 'Unsupported file type: .png' } } });
        await expect(uploadDataUriImages(`<img src="${PNG_DATA_URI}">`)).rejects.toBeTruthy();
    });
});

describe('uploadErrorMessage', () => {
    it.each([
        [{ response: { data: { error: 'File is too large — the limit is 10MB.' } } }, 'File is too large — the limit is 10MB.'],
        [{ response: { status: 413 } }, 'That image is too large to upload (max 10MB).'],
        [new Error('Network Error'), 'Network Error'],
        [{}, 'Image upload failed. Please try again.'],
    ])('surfaces a usable message', (error, expected) => {
        expect(uploadErrorMessage(error)).toBe(expected);
    });
});
