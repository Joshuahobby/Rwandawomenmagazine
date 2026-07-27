import React, { useCallback, useRef, useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import ReactQuill from 'react-quill-new';
import type QuillType from 'quill';
import { useEditorImages, type EditorImagesApi } from '../components/editor/useEditorImages';
import { normalizeEditorHtml } from '../utils/editorContent';

/**
 * Driven against a real Quill instance, not a stub: the whole point of these
 * behaviours is the markup Quill actually emits, and a stub would only prove
 * that the hook calls the methods the author of the stub expected.
 */

const CDN = 'https://res.cloudinary.com/demo/image/upload/photo.png';

const apiPost = vi.fn();
vi.mock('../services/api', () => ({
    default: { post: (...a: unknown[]) => apiPost(...a) },
}));

let api: EditorImagesApi;
let html = '';
const errors: string[] = [];

function Harness({ initial = '<p>Opening line</p>' }: { initial?: string }) {
    const ref = useRef<ReactQuill>(null);
    const [value, setValue] = useState(initial);
    html = value;
    const getQuill = useCallback((): QuillType | null => {
        try { return ref.current?.getEditor() ?? null; } catch { return null; }
    }, []);
    api = useEditorImages(getQuill, (m) => errors.push(m));
    return (
        <ReactQuill
            ref={ref}
            value={value}
            onChange={(v) => { setValue(v); html = v; }}
            modules={{ toolbar: false }}
        />
    );
}

const pngFile = () => new File([new Uint8Array([1, 2, 3])], 'photo.png', { type: 'image/png' });

beforeEach(() => {
    apiPost.mockReset();
    apiPost.mockResolvedValue({ data: { filePath: CDN } });
    errors.length = 0;
    html = '';
});

describe('inserting images', () => {
    it('places an uploaded image on its own line, centred', async () => {
        render(<Harness />);
        await act(async () => { await api.uploadAndInsert([pngFile()]); });

        // Its own <p>, not spliced into the sentence — the failure that made
        // images look broken even when the src survived.
        expect(html).toContain(`<p class="ql-align-center"><img src="${CDN}"></p>`);
        // Quill emits &nbsp; for every space; the save path normalises it.
        expect(normalizeEditorHtml(html)).toContain('Opening line');
    });

    it('does not split an empty paragraph into two', async () => {
        render(<Harness initial="<p></p>" />);
        await act(async () => { await api.uploadAndInsert([pngFile()]); });

        expect(html.match(/<img/g)).toHaveLength(1);
        // One paragraph for the image, one to carry on typing in.
        expect(html.match(/<p/g)!.length).toBeLessThanOrEqual(2);
    });

    it('stacks several images each on their own line', async () => {
        apiPost
            .mockResolvedValueOnce({ data: { filePath: 'https://cdn/a.png' } })
            .mockResolvedValueOnce({ data: { filePath: 'https://cdn/b.png' } });
        render(<Harness />);
        await act(async () => { await api.uploadAndInsert([pngFile(), pngFile()]); });

        expect(html).toContain('https://cdn/a.png');
        expect(html).toContain('https://cdn/b.png');
        expect(html).not.toMatch(/<img[^>]*><img/); // never adjacent in one block
    });

    it('inserts a library URL without uploading anything', async () => {
        render(<Harness />);
        await act(async () => { api.insertUrl('https://cdn/library.png'); });

        expect(html).toContain('https://cdn/library.png');
        expect(apiPost).not.toHaveBeenCalled();
    });

    it('reports an upload failure and inserts nothing', async () => {
        apiPost.mockRejectedValue({ response: { data: { error: 'Upload failed.' } } });
        render(<Harness />);
        await act(async () => { await api.uploadAndInsert([pngFile()]); });

        expect(errors).toEqual(['Upload failed.']);
        expect(html).not.toContain('<img');
        await waitFor(() => expect(api.uploading).toBe(0));
    });
});

describe('formatting a selected image', () => {
    const selectImage = async () => {
        const img = document.querySelector('.ql-editor img') as HTMLImageElement;
        await act(async () => { img.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
        return img;
    };

    const withImage = async () => {
        render(<Harness />);
        await act(async () => { await api.uploadAndInsert([pngFile()]); });
        await selectImage();
    };

    it('selects the image that was clicked', async () => {
        await withImage();
        expect(api.selected).not.toBeNull();
        expect(api.selected!.src).toBe(CDN);
        expect(api.selected!.align).toBe('center');
    });

    it.each([
        ['right', 'ql-align-right'],
        ['left', ''],
    ] as const)('aligns %s', async (align, expectedClass) => {
        await withImage();
        await act(async () => { api.setAlign(align); });

        if (expectedClass) expect(html).toContain(expectedClass);
        // 'left' is Quill's default, so it drops the class entirely.
        else expect(html).not.toContain('ql-align');
        expect(api.selected!.align).toBe(align);
    });

    it('sizes the image with a width attribute the sanitizer allows', async () => {
        await withImage();
        await act(async () => { api.setWidth('50%'); });

        expect(html).toContain('width="50%"');
        await act(async () => { api.setWidth(''); });
        expect(html).not.toContain('width=');
    });

    it('writes alt text onto the image', async () => {
        await withImage();
        await act(async () => { api.setAlt('Women coding in Kigali'); });

        expect(html).toContain('alt="Women coding in Kigali"');
    });

    it('removes the image and clears the selection', async () => {
        await withImage();
        await act(async () => { api.remove(); });

        expect(html).not.toContain('<img');
        expect(api.selected).toBeNull();
    });

    it('deselects when the caret moves off the image', async () => {
        await withImage();
        expect(api.selected).not.toBeNull();

        const paragraph = document.querySelector('.ql-editor p') as HTMLElement;
        await act(async () => { paragraph.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
        expect(api.selected).toBeNull();
    });
});
