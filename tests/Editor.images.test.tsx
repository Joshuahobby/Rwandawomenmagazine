import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Editor from '../pages/Editor';

/**
 * Covers the wiring rather than Quill itself: that the editor's image button,
 * paste and drop all route files through /api/media and embed the returned URL,
 * and that a rich-text paste carrying base64 images is uploaded before save.
 *
 * Quill is stubbed because it needs selection APIs jsdom does not provide; the
 * stub still exposes the real `modules` object the component builds, which is
 * the contract under test.
 */

const CLOUDINARY_URL = 'https://res.cloudinary.com/demo/image/upload/uploaded.png';
const PNG_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

type QuillModules = {
    toolbar: { handlers: { image: () => void } };
    uploader: { mimetypes: string[]; handler: (range: { index: number } | null, files: File[]) => void };
};

let capturedModules: QuillModules;
let capturedOnChange: (value: string) => void;
const setEditorContent = (html: string) => act(() => { capturedOnChange(html); });

const editorStub = {
    getSelection: vi.fn(() => ({ index: 7, length: 0 })),
    getLength: vi.fn(() => 20),
    insertEmbed: vi.fn(),
    setSelection: vi.fn(),
};

vi.mock('react-quill-new', () => {
    class MockReactQuill extends React.Component<{ modules: QuillModules; onChange: (v: string) => void }> {
        getEditor() { return editorStub; }
        render() {
            capturedModules = this.props.modules;
            capturedOnChange = this.props.onChange;
            return React.createElement('div', { 'data-testid': 'quill-editor' });
        }
    }
    return { default: MockReactQuill };
});

vi.mock('../components/MediaLibrary', () => ({ default: () => React.createElement('div') }));

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

const pngFile =() => new File([new Uint8Array([1, 2, 3])], 'screenshot.png', { type: 'image/png' });

const renderEditor = async () => {
    const navigate = vi.fn();
    render(
        <MemoryRouter initialEntries={['/editor']}>
            <Editor navigate={navigate} />
        </MemoryRouter>,
    );
    await screen.findByTestId('quill-editor');
    return { navigate };
};

beforeEach(() => {
    vi.clearAllMocks();
    apiGet.mockImplementation((url: string) => {
        if (url === '/categories') return Promise.resolve({ data: [{ id: 1, name: 'News' }] });
        if (url === '/tags') return Promise.resolve({ data: [] });
        return Promise.resolve({ data: {} });
    });
    apiPost.mockImplementation((url: string) => {
        if (url === '/media') return Promise.resolve({ data: { filePath: CLOUDINARY_URL } });
        return Promise.resolve({ data: { status: 'draft', slug: 'a-story' } });
    });
    vi.spyOn(window, 'alert').mockImplementation(() => { });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Editor inline images', () => {
    it('accepts the image types the API accepts, not just Quill\'s png/jpeg default', async () => {
        await renderEditor();
        expect(capturedModules.uploader.mimetypes).toEqual(
            expect.arrayContaining(['image/png', 'image/jpeg', 'image/gif', 'image/webp']),
        );
    });

    it('uploads a pasted or dropped image and embeds the hosted URL, not base64', async () => {
        await renderEditor();

        capturedModules.uploader.handler({ index: 3 }, [pngFile()]);

        await waitFor(() => expect(editorStub.insertEmbed).toHaveBeenCalled());
        expect(apiPost).toHaveBeenCalledWith('/media', expect.any(FormData), expect.anything());
        expect(editorStub.insertEmbed).toHaveBeenCalledWith(3, 'image', CLOUDINARY_URL, 'user');
    });

    it('inserts several dropped images in order', async () => {
        await renderEditor();

        capturedModules.uploader.handler({ index: 2 }, [pngFile(), pngFile()]);

        await waitFor(() => expect(editorStub.insertEmbed).toHaveBeenCalledTimes(2));
        expect(editorStub.insertEmbed.mock.calls.map(c => c[0])).toEqual([2, 3]);
    });

    it('falls back to the caret when the drop reports no range', async () => {
        await renderEditor();

        capturedModules.uploader.handler(null, [pngFile()]);

        await waitFor(() => expect(editorStub.insertEmbed).toHaveBeenCalled());
        expect(editorStub.insertEmbed.mock.calls[0][0]).toBe(7); // getSelection().index
    });

    it('tells the author when an upload fails instead of losing the image silently', async () => {
        apiPost.mockRejectedValueOnce({ response: { data: { error: 'Unsupported file type: .tiff' } } });
        await renderEditor();

        capturedModules.uploader.handler({ index: 0 }, [pngFile()]);

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Unsupported file type: .tiff'));
        expect(editorStub.insertEmbed).not.toHaveBeenCalled();
    });

    it('opens a picker limited to supported images and uploads the choice', async () => {
        const clicked: HTMLInputElement[] = [];
        vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
            clicked.push(this);
        });
        await renderEditor();

        capturedModules.toolbar.handlers.image();

        expect(clicked).toHaveLength(1);
        expect(clicked[0].accept).toContain('image/webp');

        Object.defineProperty(clicked[0], 'files', { value: [pngFile()] });
        fireEvent.change(clicked[0]);

        await waitFor(() => expect(editorStub.insertEmbed).toHaveBeenCalledWith(7, 'image', CLOUDINARY_URL, 'user'));
    });
});

describe('Editor save', () => {
    const fillRequiredFields = () => {
        fireEvent.change(screen.getByPlaceholderText('Enter article title...'), {
            target: { value: 'A Story' },
        });
        fireEvent.change(screen.getByTitle('Select category'), { target: { value: '1' } });
    };

    it('uploads base64 images pasted as rich text before writing the article', async () => {
        await renderEditor();
        fillRequiredFields();
        setEditorContent(`<p>Copied from a doc</p><p><img src="${PNG_DATA_URI}"></p>`);

        fireEvent.click(screen.getByText('Save Draft'));

        await waitFor(() => expect(apiPost).toHaveBeenCalledWith('/articles', expect.anything()));
        const body = apiPost.mock.calls.find(c => c[0] === '/articles')![1] as { content: string };
        expect(body.content).not.toContain('base64');
        expect(body.content).toContain(CLOUDINARY_URL);
        expect(body.content).toContain('Copied from a doc');
    });

    it('leaves content with no embedded images exactly as authored', async () => {
        await renderEditor();
        fillRequiredFields();
        const html = '<p>Just <strong>words</strong></p>';
        setEditorContent(html);

        fireEvent.click(screen.getByText('Save Draft'));

        await waitFor(() => expect(apiPost).toHaveBeenCalledWith('/articles', expect.anything()));
        const body = apiPost.mock.calls.find(c => c[0] === '/articles')![1] as { content: string };
        expect(body.content).toBe(html);
        expect(apiPost.mock.calls.some(c => c[0] === '/media')).toBe(false);
    });

    it('aborts the save when an embedded image cannot be uploaded', async () => {
        apiPost.mockImplementation((url: string) => {
            if (url === '/media') return Promise.reject({ response: { data: { error: 'Upload failed.' } } });
            return Promise.resolve({ data: { status: 'draft' } });
        });
        const { navigate } = await renderEditor();
        fillRequiredFields();
        setEditorContent(`<p><img src="${PNG_DATA_URI}"></p>`);

        fireEvent.click(screen.getByText('Save Draft'));

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Nothing was saved')));
        expect(apiPost.mock.calls.some(c => c[0] === '/articles')).toBe(false);
        expect(navigate).not.toHaveBeenCalled();
    });
});
