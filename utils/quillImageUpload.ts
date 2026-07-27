import api from '../services/api';

/**
 * Inline article images go to Cloudinary, never into the article body.
 *
 * Quill's stock behaviour for the toolbar image button, for a pasted image and
 * for a dropped file is the same: read the file with FileReader and embed it as
 * a base64 `data:` URI (see quill/modules/uploader.js). Article HTML is
 * sanitized on write against a scheme allowlist that deliberately excludes
 * `data:` (utils/sanitizePolicy.ts), so the server rewrote every one of those to
 * `<img src="">`. The image looked correct while editing — the browser renders
 * the base64 blob happily — and disappeared the moment the article was saved
 * and read back.
 *
 * Uploading instead gives an https URL that both sanitizers pass through, keeps
 * the article row small, and files the image in the Media Library so it can be
 * reused and deleted like any other asset.
 */

/**
 * Mime types the editor accepts for inline images. Kept in step with the
 * server's multer filter (server/middleware/upload.ts): offering a type the API
 * rejects turns into a failed round trip, which reads to the author as another
 * silent failure.
 */
export const EDITOR_IMAGE_MIMETYPES = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
];

/** Matches the multer limit, so oversized files fail fast with a real message. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * The upload endpoint derives the file type from the *extension* of the
 * filename, so a File rebuilt from a data URI needs a plausible one.
 */
const EXTENSION_BY_MIME: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
};

export function isDataUri(src: string | null | undefined): boolean {
    return !!src && /^\s*data:/i.test(src);
}

/** Pulls the API's own message out of an axios error, falling back to a generic one. */
export function uploadErrorMessage(error: unknown): string {
    const err = error as {
        response?: { data?: { error?: string; message?: string }; status?: number };
        message?: string;
    };
    if (err?.response?.status === 413) return 'That image is too large to upload (max 10MB).';
    return (
        err?.response?.data?.error
        || err?.response?.data?.message
        || err?.message
        || 'Image upload failed. Please try again.'
    );
}

/**
 * Uploads one file through /api/media and returns its Cloudinary URL.
 * Throws with a readable message so callers can surface it rather than
 * dropping the image on the floor.
 */
export async function uploadEditorImage(file: File): Promise<string> {
    if (file.size > MAX_IMAGE_BYTES) {
        throw new Error(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is 10MB.`);
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    const url = res.data?.filePath;
    if (typeof url !== 'string' || !url) {
        throw new Error('The upload succeeded but returned no image URL.');
    }
    return url;
}

/**
 * Rebuilds a File from a base64 (or percent-encoded) data URI.
 * Returns null for anything that isn't a decodable image data URI.
 */
export function dataUriToFile(dataUri: string, nameHint: string): File | null {
    const match = /^\s*data:([^;,]+)((?:;[^,]*)*),([\s\S]*)$/i.exec(dataUri);
    if (!match) return null;

    const mime = match[1].toLowerCase();
    if (!mime.startsWith('image/')) return null;

    const isBase64 = /;base64/i.test(match[2]);
    const payload = match[3];

    let bytes: Uint8Array;
    try {
        if (isBase64) {
            // Attribute values can carry line breaks; atob's forgiving decode
            // handles them, but jsdom is stricter, so strip them first.
            const binary = atob(payload.replace(/\s/g, ''));
            bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        } else {
            bytes = new TextEncoder().encode(decodeURIComponent(payload));
        }
    } catch {
        return null;
    }

    const ext = EXTENSION_BY_MIME[mime] || mime.split('/')[1]?.replace(/\W/g, '') || 'png';
    return new File([bytes], `${nameHint}.${ext}`, { type: mime });
}

/**
 * Finds every base64 image left in the article HTML and replaces it with an
 * uploaded URL.
 *
 * The toolbar and drop/paste handlers upload up front, so this only fires for
 * the path they can't intercept: pasting rich text that *contains* images
 * (Word, Google Docs, a web page), where Quill keeps the data URIs inside the
 * pasted HTML instead of routing the files through its uploader.
 *
 * Returns the original string untouched when there is nothing to do, so the
 * ordinary save path is byte-for-byte unchanged.
 */
export async function uploadDataUriImages(
    html: string | null | undefined,
): Promise<{ html: string; uploaded: number }> {
    const original = html || '';
    if (!original.includes('data:image')) return { html: original, uploaded: 0 };

    const doc = new DOMParser().parseFromString(original, 'text/html');
    const images = Array.from(doc.querySelectorAll('img')).filter(img => isDataUri(img.getAttribute('src')));
    if (images.length === 0) return { html: original, uploaded: 0 };

    // The same screenshot pasted twice is one upload, not two.
    const uploadedByDataUri = new Map<string, string>();
    let uploaded = 0;

    for (const img of images) {
        const src = img.getAttribute('src') as string;

        const cached = uploadedByDataUri.get(src);
        if (cached) {
            img.setAttribute('src', cached);
            continue;
        }

        const file = dataUriToFile(src, `pasted-image-${Date.now()}-${uploaded + 1}`);
        if (!file) {
            throw new Error('An embedded image in this article could not be read. Remove it and insert it again.');
        }

        const url = await uploadEditorImage(file);
        uploadedByDataUri.set(src, url);
        img.setAttribute('src', url);
        uploaded += 1;
    }

    return { html: doc.body.innerHTML, uploaded };
}
