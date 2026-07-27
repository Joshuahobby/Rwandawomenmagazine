import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import type QuillType from 'quill';
import 'react-quill-new/dist/quill.snow.css';
import { PageView } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { sanitizeArticleHtml } from '../utils/sanitize';
import { EDITOR_IMAGE_MIMETYPES, uploadDataUriImages, uploadErrorMessage } from '../utils/quillImageUpload';
import { normalizeEditorHtml } from '../utils/editorContent';
import '../utils/quillFormats';
import MediaLibrary from '../components/MediaLibrary';
import ImageToolbar from '../components/editor/ImageToolbar';
import SeoPanel, { EMPTY_SEO, SeoFields } from '../components/editor/SeoPanel';
import EditorStatusBar from '../components/editor/EditorStatusBar';
import { useEditorImages } from '../components/editor/useEditorImages';
import { useToasts, ToastStack } from '../components/editor/useToasts';
import { useAutosave, readDraft, clearDraft } from '../components/editor/useAutosave';

interface EditorProps {
    navigate: (view: PageView, id?: string) => void; // eslint-disable-line
}

interface Category {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

/** Everything the autosave snapshot needs to restore a session. */
interface DraftShape {
    title: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    categoryId: number | '';
    tags: number[];
    isFeatured: boolean;
    seo: SeoFields;
}

/** Which field the media library modal is currently choosing an image for. */
type MediaTarget = 'featured' | 'inline' | 'ogImage' | null;

const Editor: React.FC<EditorProps> = ({ navigate }) => {
    // The URL owns which article is open; /editor (no id) is always a new one.
    const { id: articleId } = useParams<{ id: string }>();
    const { user } = useAuth();
    const canPublish = user?.role === 'Editor' || user?.role === 'Admin';

    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [tags, setTags] = useState<number[]>([]);
    const [isFeatured, setIsFeatured] = useState(false);
    const [status, setStatus] = useState<'draft' | 'review' | 'published' | 'archived'>('draft');
    const [seo, setSeo] = useState<SeoFields>(EMPTY_SEO);
    const [slug, setSlug] = useState('');

    const [categories, setCategories] = useState<Category[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [mediaTarget, setMediaTarget] = useState<MediaTarget>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
    const [recoverable, setRecoverable] = useState<DraftShape | null>(null);

    const quillRef = useRef<ReactQuill>(null);
    const { toasts, notify, dismiss } = useToasts();

    // react-quill throws rather than returning null when the editor is not yet
    // instantiated, so every caller goes through this guard.
    const getQuill = useCallback((): QuillType | null => {
        try {
            return quillRef.current?.getEditor() ?? null;
        } catch {
            return null;
        }
    }, []);

    const images = useEditorImages(getQuill, notify.error);

    const draft: DraftShape = useMemo(
        () => ({ title, excerpt, content, featuredImage, categoryId, tags, isFeatured, seo }),
        [title, excerpt, content, featuredImage, categoryId, tags, isFeatured, seo],
    );
    const autosave = useAutosave(articleId, draft, { enabled: !isLoading });

    const applyDraft = useCallback((data: DraftShape) => {
        setTitle(data.title);
        setExcerpt(data.excerpt);
        setContent(data.content);
        setFeaturedImage(data.featuredImage);
        setCategoryId(data.categoryId);
        setTags(data.tags);
        setIsFeatured(data.isFeatured);
        setSeo(data.seo ?? EMPTY_SEO);
    }, []);

    // `modules` is a "dirty prop" in react-quill-new: a new object identity tears
    // the editor down and rebuilds it, so this must stay referentially stable.
    const pickAndUploadImage = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = EDITOR_IMAGE_MIMETYPES.join(',');
        input.multiple = true;
        input.addEventListener('change', () => {
            const files = Array.from(input.files || []);
            if (files.length > 0) void images.uploadAndInsert(files);
        });
        input.click();
    }, [images]);

    const imagesRef = useRef(images);
    imagesRef.current = images;
    const pickRef = useRef(pickAndUploadImage);
    pickRef.current = pickAndUploadImage;

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                // Body headings start at h2: the article template already renders
                // the title as the page's h1, and a second one competes with it.
                [{ 'header': [2, 3, 4, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block', 'divider'],
                ['link', 'image', 'video'],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                ['clean'],
            ],
            handlers: {
                image: () => pickRef.current(),
                divider: function (this: { quill: QuillType }) {
                    const quill = this.quill;
                    const index = quill.getSelection(true)?.index ?? quill.getLength();
                    quill.insertEmbed(index, 'divider', true, 'user');
                    quill.setSelection(index + 1, 0, 'silent');
                },
            },
        },
        // Quill routes pasted and dropped image files through the uploader
        // module. Its default handler base64-encodes them, which the write-side
        // sanitizer then strips; this one uploads instead. The default mimetype
        // list is png/jpeg only, so a pasted webp or gif was previously ignored
        // outright — nothing was inserted at all.
        uploader: {
            mimetypes: EDITOR_IMAGE_MIMETYPES,
            handler: (range: { index: number } | null, files: File[]) => {
                void imagesRef.current.uploadAndInsert(files, range?.index);
            },
        },
        clipboard: { matchVisual: false },
    }), []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, tagsRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/tags')
                ]);
                setCategories(catsRes.data);
                setAvailableTags(tagsRes.data);

                if (articleId) {
                    const artRes = await api.get(`/articles/id/${articleId}`);
                    const art = artRes.data;
                    setTitle(art.title);
                    setExcerpt(art.excerpt || '');
                    setContent(art.content || '');
                    setFeaturedImage(art.featuredImage || '');
                    setCategoryId(art.categoryId);
                    setTags(art.tags?.map((t: { id: number }) => t.id) || []);
                    setIsFeatured(art.isFeatured);
                    setStatus(art.status);
                    setSlug(art.slug || '');
                    setSeo({
                        metaTitle: art.seoMeta?.metaTitle || '',
                        metaDescription: art.seoMeta?.metaDescription || '',
                        keywords: art.seoMeta?.keywords || '',
                        ogImage: art.seoMeta?.ogImage || '',
                    });

                    if (art.status === 'published') {
                        setPublishedUrl(`${window.location.origin}/article/${art.slug}`);
                    }
                }

                // Offer the local snapshot rather than applying it: silently
                // overwriting what the server holds is how authors lose edits
                // they made somewhere else.
                const stored = readDraft<DraftShape>(articleId);
                if (stored?.data) setRecoverable(stored.data);
            } catch (error) {
                console.error('Failed to fetch editor data:', error);
                notify.error('Could not load the editor. Check your connection and reload.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [articleId, notify]);

    const handleSave = async (isPublish: boolean = false) => {
        if (!title.trim()) {
            notify.error('Give the article a title before saving.');
            return;
        }
        if (!categoryId) {
            notify.error('Choose a category before saving.');
            return;
        }

        setIsSaving(true);

        // Pasting rich text (Word, Google Docs, a web page) can carry images as
        // base64 inside the pasted HTML, which bypasses Quill's uploader. Those
        // would be stripped to <img src=""> on write, so upload them here and
        // abort the save rather than quietly losing them.
        let contentToSave = content;
        try {
            const swept = await uploadDataUriImages(content);
            if (swept.uploaded > 0) {
                contentToSave = swept.html;
                setContent(swept.html);
                notify.info(`Uploaded ${swept.uploaded} embedded image${swept.uploaded > 1 ? 's' : ''}.`);
            }
            // Undo Quill's `&nbsp;`-for-every-space encoding, which otherwise
            // stops long paragraphs wrapping on the published page.
            contentToSave = normalizeEditorHtml(contentToSave);
        } catch (error) {
            console.error('Failed to upload embedded images:', error);
            setIsSaving(false);
            notify.error(`${uploadErrorMessage(error)}\n\nNothing was saved — your article is still open.`);
            return;
        }

        // Authors cannot publish, so their publish action submits for review
        // instead of firing a request the API will reject.
        const nextStatus = isPublish
            ? (canPublish ? 'published' : 'review')
            : (articleId ? status : 'draft');

        const hasSeo = Object.values(seo).some(value => value.trim() !== '');
        const payload = {
            title,
            excerpt,
            content: contentToSave,
            featuredImage,
            categoryId: Number(categoryId),
            tags,
            isFeatured,
            status: nextStatus,
            ...(hasSeo ? { seo } : {}),
        };

        try {
            const res = articleId
                ? await api.put(`/articles/${articleId}`, payload)
                : await api.post('/articles', payload);

            const saved = res.data;
            setStatus(saved.status);
            if (saved.slug) setSlug(saved.slug);
            if (saved.status === 'published' && saved.slug) {
                setPublishedUrl(`${window.location.origin}/article/${saved.slug}`);
            }

            // The server now holds this content, so the local snapshot is spent.
            autosave.markClean();
            clearDraft(articleId);

            if (isPublish && !canPublish) {
                notify.success('Submitted for review — an Editor will publish it.');
            }

            navigate('DASHBOARD');
        } catch (error) {
            console.error('Failed to save article:', error);
            // Surface the API's own message (e.g. the 403 explaining that only
            // Editors may publish) rather than a generic failure string.
            const err = error as { response?: { data?: { error?: string; details?: string } }; message?: string };
            const message = err?.response?.data?.error
                || err?.response?.data?.details
                || err?.message;
            notify.error(typeof message === 'string' && message ? message : 'Failed to save article. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLeave = () => {
        if (autosave.isDirty && !window.confirm('You have unsaved changes. Leave the editor anyway?')) return;
        navigate('DASHBOARD');
    };

    const handleMediaSelect = (url: string) => {
        if (mediaTarget === 'featured') setFeaturedImage(url);
        else if (mediaTarget === 'ogImage') setSeo(current => ({ ...current, ogImage: url }));
        else if (mediaTarget === 'inline') images.insertUrl(url);
        setMediaTarget(null);
    };

    const toggleTag = (tagId: number) => {
        setTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Loading Editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200 h-screen flex flex-col overflow-hidden animate-fade-in">
            {/* Toolbar */}
            <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={handleLeave} title="Back to dashboard" className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-icons-round text-2xl">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{articleId ? 'Edit Article' : 'New Article'}</span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            Rwanda Women Magazine
                            <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-orange-400 animate-pulse' : autosave.isDirty ? 'bg-slate-300' : 'bg-green-400'}`}></span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!previewMode && (
                        <button
                            onClick={() => setFocusMode(!focusMode)}
                            title={focusMode ? 'Show settings' : 'Focus mode'}
                            className={`px-3 py-2 rounded-lg text-sm transition-all ${focusMode ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                            <span className="material-icons-round text-lg">{focusMode ? 'fullscreen_exit' : 'fullscreen'}</span>
                        </button>
                    )}
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${previewMode ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        <span className="material-icons-round text-lg">{previewMode ? 'edit' : 'visibility'}</span>
                        {previewMode ? 'Back to Edit' : 'Preview'}
                    </button>
                    {!previewMode && (
                        <>
                            <button
                                disabled={isSaving}
                                onClick={() => handleSave(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button
                                disabled={isSaving}
                                onClick={() => handleSave(true)}
                                className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <span className="material-icons-round text-sm">publish</span>
                                {articleId && status === 'published'
                                    ? 'Update'
                                    : canPublish ? 'Publish' : 'Submit for Review'}
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Recovered draft prompt */}
            {recoverable && !previewMode && (
                <div className="flex flex-wrap items-center gap-3 border-b border-orange-500/20 bg-orange-500/5 px-6 py-3 text-sm">
                    <span className="material-icons-round text-orange-500 text-lg">history</span>
                    <p className="flex-1 text-orange-900/80 dark:text-orange-300/80">
                        An unsaved local draft of this article was found. Restore it?
                    </p>
                    <button
                        onClick={() => { applyDraft(recoverable); setRecoverable(null); }}
                        className="rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-orange-600"
                    >
                        Restore
                    </button>
                    <button
                        onClick={() => { clearDraft(articleId); setRecoverable(null); }}
                        className="rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700/70 transition-colors hover:bg-orange-500/10 dark:text-orange-300/70"
                    >
                        Discard
                    </button>
                </div>
            )}

            <main className="flex-1 flex overflow-hidden">
                {/* Editor Area */}
                <section className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#1a0b16] shadow-sm m-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-500">
                    <div className="flex-1 overflow-y-auto px-8 md:px-24 py-16 scrollbar-hide">
                        {previewMode ? (
                            <div className="max-w-4xl mx-auto animate-fade-in">
                                <div className="mb-12 text-center">
                                    <span className="inline-block px-3 py-1 mb-6 border border-primary/20 rounded-full bg-primary/5 text-xs font-bold uppercase tracking-widest text-primary">
                                        {categories.find(c => c.id === categoryId)?.name || 'Preview'}
                                    </span>
                                    <h1 className="font-display text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                        {title || 'Untitled Article'}
                                    </h1>
                                    <p className="text-xl text-slate-500 dark:text-slate-400 font-serif max-w-2xl mx-auto leading-relaxed italic border-l-4 border-primary/30 pl-6 py-2">
                                        {excerpt || 'No excerpt provided.'}
                                    </p>
                                </div>
                                {featuredImage && (
                                    <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 aspect-video group">
                                        <img src={featuredImage} alt="Preview" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                                    </div>
                                )}
                                {/* Same classes the article page uses, so the preview
                                    reflects the real layout rather than an approximation. */}
                                <article className="article-content font-serif text-lg md:text-xl leading-[1.8] text-slate-800 dark:text-slate-200 prose dark:prose-invert max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(content) }} />
                                </article>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto">
                                <textarea
                                    className="w-full bg-transparent text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white placeholder-slate-200 dark:placeholder-white/10 border-none focus:ring-0 resize-none overflow-hidden p-0 mb-6 leading-tight transition-all"
                                    rows={1}
                                    placeholder="Enter article title..."
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = target.scrollHeight + 'px';
                                    }}
                                />

                                <textarea
                                    className="w-full bg-transparent text-lg text-slate-500 dark:text-slate-400 italic placeholder-slate-200 dark:placeholder-white/10 border-none focus:ring-0 resize-none overflow-hidden p-0 mb-10 transition-all border-l-2 border-slate-100 dark:border-white/5 pl-4"
                                    rows={2}
                                    placeholder="Write a compelling excerpt..."
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                />

                                <ImageToolbar images={images} />

                                <div className="editor-container relative rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner bg-slate-50/50 dark:bg-black/20">
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        modules={modules}
                                        className="min-h-[400px]"
                                        placeholder="Start telling your story..."
                                    />
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setMediaTarget('inline')}
                                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10"
                                    >
                                        <span className="material-icons-round text-sm">photo_library</span>
                                        Insert from library
                                    </button>
                                    <p className="text-[11px] text-slate-400">
                                        Drag, paste or use the toolbar to add images — they upload automatically.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {!previewMode && (
                        <EditorStatusBar
                            content={content}
                            isDirty={autosave.isDirty}
                            isSaving={isSaving}
                            draftSavedAt={autosave.savedAt}
                            uploading={images.uploading}
                        />
                    )}
                </section>

                {/* Sidebar Settings */}
                {!previewMode && !focusMode && (
                    <aside className="w-80 bg-background-light dark:bg-[#120710] border-l border-slate-200 dark:border-white/5 flex flex-col overflow-y-auto">
                        <div className="p-6 space-y-8">
                            {publishedUrl && (
                                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl animate-fade-in">
                                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Article is Live</h4>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            aria-label="Published article URL"
                                            value={publishedUrl}
                                            className="flex-1 bg-white dark:bg-black/20 border-none text-[10px] rounded px-2 py-1 text-slate-500"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(publishedUrl);
                                                notify.success('URL copied to clipboard.');
                                            }}
                                            className="p-1 hover:bg-primary/20 rounded text-primary transition-colors"
                                        >
                                            <span className="material-icons-round text-sm">content_copy</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-[#1a0b16] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-all hover:shadow-md">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Metadata</h3>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400'
                                        }`}>{status}</span>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                                        <select
                                            title="Select category"
                                            className="w-full bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-white/5 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/50"
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(Number(e.target.value))}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Feature on Home</span>
                                        <div
                                            onClick={() => setIsFeatured(!isFeatured)}
                                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300 ${isFeatured ? 'bg-primary' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isFeatured ? 'left-6' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a0b16] p-5 rounded-2xl border border-slate-100 dark:border-white/5 transition-all">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 font-display">Featured Image</h3>
                                <div
                                    className="w-full aspect-[16/10] bg-slate-50 dark:bg-black/40 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative group transition-all hover:border-primary/50"
                                    onClick={() => setMediaTarget('featured')}
                                >
                                    {featuredImage ? (
                                        <>
                                            <img src={featuredImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Preview" />
                                            <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <div className="bg-white text-primary text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">Change Media</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center cursor-pointer group-hover:scale-110 transition-transform">
                                            <span className="material-icons-round text-slate-300 dark:text-white/10 text-4xl mb-2">add_photo_alternate</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Header Image</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Or paste external URL..."
                                    className="w-full mt-4 bg-transparent border-b border-slate-100 dark:border-white/5 text-[10px] py-2 focus:ring-0 focus:border-primary transition-all text-slate-500"
                                    value={featuredImage}
                                    onChange={(e) => setFeaturedImage(e.target.value)}
                                />
                            </div>

                            <div className="bg-white dark:bg-[#1a0b16] p-5 rounded-2xl border border-slate-100 dark:border-white/5">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 font-display">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${tags.includes(tag.id)
                                                ? 'bg-primary text-white shadow-md shadow-primary/20 border-primary'
                                                : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent'
                                                }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <SeoPanel
                                seo={seo}
                                onChange={setSeo}
                                fallbackTitle={title}
                                fallbackDescription={excerpt}
                                slug={slug}
                            />
                        </div>
                    </aside>
                )}
            </main>

            {/* Media Library Modal */}
            {mediaTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                {mediaTarget === 'inline' ? 'Insert Into Article' : 'Select Media'}
                            </h3>
                            <button
                                onClick={() => setMediaTarget(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <span className="material-icons text-slate-500">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <MediaLibrary selectionMode={true} onSelect={handleMediaSelect} />
                        </div>
                    </div>
                </div>
            )}

            <ToastStack toasts={toasts} onDismiss={dismiss} />
        </div>
    );
};

export default Editor;
