import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Quill } from 'react-quill-new';
import type QuillType from 'quill';
import Editor from '../pages/Editor';

/**
 * Drives the real editor against a real Quill instance. The one thing stubbed
 * is the network, because the behaviour under test is what markup reaches the
 * API — which is exactly where inline images were being lost.
 */

const CLOUDINARY_URL = 'https://res.cloudinary.com/demo/image/upload/uploaded.png';
const PNG_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

vi.mock('../components/MediaLibrary', () => ({
    default: ({ onSelect }: { onSelect: (url: string) => void }) =>
        React.createElement('button', { onClick: () => onSelect('https://cdn/from-library.png') }, 'pick-asset'),
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ user: { id: '1', role: 'Editor', fullName: 'Test Editor' } }),
}));

const apiGet = vi.fn();
const apiPost = vi.fn();
const apiPut = vi.fn();
vi.mock('../services/api', () => ({
    default: {
        get: (...a: unknown[]) => apiGet(...a),
        post: (...a: unknown[]) => apiPost(...a),
        put: (...a: unknown[]) => apiPut(...a),
    },
}));

const pngFile = () => new File([new Uint8Array([1, 2, 3])], 'screenshot.png', { type: 'image/png' });

/** The page owns its Quill ref, so reach the instance the way Quill itself does. */
const editor = (): QuillType => Quill.find(document.querySelector('.ql-editor')!.parentElement!) as QuillType;

const setBody = async (html: string) => {
    await act(async () => {
        editor().clipboard.dangerouslyPasteHTML(html, 'user');
    });
};

const renderEditor = async (articleId?: string) => {
    const navigate = vi.fn();
    render(
        <MemoryRouter initialEntries={[articleId ? `/editor/${articleId}` : '/editor']}>
            <Routes>
                <Route path="/editor" element={<Editor navigate={navigate} />} />
                <Route path="/editor/:id" element={<Editor navigate={navigate} />} />
            </Routes>
        </MemoryRouter>,
    );
    await screen.findByPlaceholderText('Enter article title...');
    return { navigate };
};

const fillRequiredFields = () => {
    fireEvent.change(screen.getByPlaceholderText('Enter article title...'), { target: { value: 'A Story' } });
    fireEvent.change(screen.getByTitle('Select category'), { target: { value: '1' } });
};

const savedPayload = () => apiPost.mock.calls.find(c => c[0] === '/articles')![1] as {
    content: string;
    seo?: Record<string, string>;
};

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    apiGet.mockImplementation((url: string) => {
        if (url === '/categories') return Promise.resolve({ data: [{ id: 1, name: 'News' }] });
        if (url === '/tags') return Promise.resolve({ data: [] });
        return Promise.resolve({ data: {} });
    });
    apiPost.mockImplementation((url: string) => {
        if (url === '/media') return Promise.resolve({ data: { filePath: CLOUDINARY_URL } });
        return Promise.resolve({ data: { status: 'draft', slug: 'a-story' } });
    });
    apiPut.mockResolvedValue({ data: { status: 'draft', slug: 'a-story' } });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('inserting an image from the toolbar', () => {
    it('uploads the file and puts a hosted image in the body', async () => {
        const clicked: HTMLInputElement[] = [];
        vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
            clicked.push(this);
        });
        await renderEditor();

        fireEvent.click(document.querySelector('button.ql-image')!);
        expect(clicked).toHaveLength(1);
        expect(clicked[0].accept).toContain('image/webp');

        Object.defineProperty(clicked[0], 'files', { value: [pngFile()] });
        await act(async () => { fireEvent.change(clicked[0]); });

        await waitFor(() => {
            expect(document.querySelector(`.ql-editor img[src="${CLOUDINARY_URL}"]`)).not.toBeNull();
        });
        expect(apiPost).toHaveBeenCalledWith('/media', expect.any(FormData), expect.anything());
        // Never base64 — that is what the sanitizer strips on write.
        expect(document.querySelector('.ql-editor')!.innerHTML).not.toContain('base64');
    });
});

describe('inserting from the media library', () => {
    it('embeds an existing asset without re-uploading it', async () => {
        await renderEditor();

        fireEvent.click(screen.getByText('Insert from library'));
        await act(async () => { fireEvent.click(await screen.findByText('pick-asset')); });

        await waitFor(() => {
            expect(document.querySelector('.ql-editor img[src="https://cdn/from-library.png"]')).not.toBeNull();
        });
        expect(apiPost.mock.calls.some(c => c[0] === '/media')).toBe(false);
    });
});

describe('saving', () => {
    it('uploads base64 images pasted as rich text before writing the article', async () => {
        await renderEditor();
        fillRequiredFields();
        await setBody(`<p>Copied from a doc</p><p><img src="${PNG_DATA_URI}"></p>`);

        fireEvent.click(screen.getByText('Save Draft'));

        await waitFor(() => expect(apiPost).toHaveBeenCalledWith('/articles', expect.anything()));
        const body = savedPayload();
        expect(body.content).not.toContain('base64');
        expect(body.content).toContain(CLOUDINARY_URL);
        expect(body.content).toContain('Copied from a doc');
    });

    it('stores ordinary spaces, not Quill\'s &nbsp; encoding', async () => {
        await renderEditor();
        fillRequiredFields();
        await setBody('<p>alpha beta gamma delta</p>');

        fireEvent.click(screen.getByText('Save Draft'));

        await waitFor(() => expect(apiPost).toHaveBeenCalledWith('/articles', expect.anything()));
        // &nbsp; suppresses line wrapping, so a long paragraph overflows its column.
        expect(savedPayload().content).not.toContain('&nbsp;');
        expect(savedPayload().content).toContain('alpha beta gamma delta');
    });

    it('refuses to save without a title and says so without a blocking dialog', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
        await renderEditor();

        fireEvent.click(screen.getByText('Save Draft'));

        expect(await screen.findByText(/Give the article a title/)).toBeInTheDocument();
        expect(alertSpy).not.toHaveBeenCalled();
        expect(apiPost.mock.calls.some(c => c[0] === '/articles')).toBe(false);
    });

    it('aborts the save when an embedded image cannot be uploaded', async () => {
        apiPost.mockImplementation((url: string) => {
            if (url === '/media') return Promise.reject({ response: { data: { error: 'Upload failed.' } } });
            return Promise.resolve({ data: { status: 'draft' } });
        });
        const { navigate } = await renderEditor();
        fillRequiredFields();
        await setBody(`<p><img src="${PNG_DATA_URI}"></p>`);

        fireEvent.click(screen.getByText('Save Draft'));

        expect(await screen.findByText(/Nothing was saved/)).toBeInTheDocument();
        expect(apiPost.mock.calls.some(c => c[0] === '/articles')).toBe(false);
        expect(navigate).not.toHaveBeenCalled();
    });
});

describe('SEO metadata', () => {
    it('loads seoMeta from the API and sends it back on save', async () => {
        apiGet.mockImplementation((url: string) => {
            if (url === '/categories') return Promise.resolve({ data: [{ id: 1, name: 'News' }] });
            if (url === '/tags') return Promise.resolve({ data: [] });
            return Promise.resolve({
                data: {
                    id: 'abc', title: 'Existing', excerpt: '', content: '<p>body</p>',
                    categoryId: 1, isFeatured: false, status: 'draft', slug: 'existing',
                    seoMeta: { metaTitle: 'Stored title', metaDescription: 'Stored description', keywords: 'a,b', ogImage: '' },
                },
            });
        });
        await renderEditor('abc');

        const metaTitle = screen.getByLabelText('Meta Title') as HTMLInputElement;
        expect(metaTitle.value).toBe('Stored title');

        fireEvent.change(metaTitle, { target: { value: 'Rewritten for search' } });
        fireEvent.click(screen.getByText('Save Draft'));

        await waitFor(() => expect(apiPut).toHaveBeenCalled());
        const body = apiPut.mock.calls[0][1] as { seo: Record<string, string> };
        expect(body.seo.metaTitle).toBe('Rewritten for search');
        expect(body.seo.keywords).toBe('a,b');
    });

    it('omits the seo block entirely when every field is blank', async () => {
        await renderEditor();
        fillRequiredFields();

        fireEvent.click(screen.getByText('Save Draft'));

        await waitFor(() => expect(apiPost).toHaveBeenCalledWith('/articles', expect.anything()));
        expect(savedPayload().seo).toBeUndefined();
    });
});
