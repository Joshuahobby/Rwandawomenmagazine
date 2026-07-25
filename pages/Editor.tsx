import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { PageView } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { sanitizeArticleHtml } from '../utils/sanitize';
import MediaLibrary from '../components/MediaLibrary';

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

    const [categories, setCategories] = useState<Category[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ]
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

                    if (art.status === 'published') {
                        setPublishedUrl(`${window.location.origin}/article/${art.slug}`);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch editor data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [articleId]);

    const handleSave = async (isPublish: boolean = false) => {
        if (!title || !categoryId) {
            alert('Please provide a title and category');
            return;
        }

        setIsSaving(true);

        // Authors cannot publish, so their publish action submits for review
        // instead of firing a request the API will reject.
        const nextStatus = isPublish
            ? (canPublish ? 'published' : 'review')
            : (articleId ? status : 'draft');

        const payload = {
            title,
            excerpt,
            content,
            featuredImage,
            categoryId: Number(categoryId),
            tags,
            isFeatured,
            status: nextStatus
        };

        try {
            const res = articleId
                ? await api.put(`/articles/${articleId}`, payload)
                : await api.post('/articles', payload);

            const saved = res.data;
            setStatus(saved.status);
            if (saved.status === 'published') {
                setPublishedUrl(`${window.location.origin}/article/${saved.slug}`);
            }
            if (isPublish && !canPublish) {
                alert('Submitted for review — an Editor will publish it.');
            }
            navigate('DASHBOARD');
        } catch (error) {
            console.error('Failed to save article:', error);
            const message = (error as { response?: { data?: { error?: string } } })
                ?.response?.data?.error;
            alert(message || 'Failed to save article');
        } finally {
            setIsSaving(false);
        }
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
                    <button onClick={() => navigate('DASHBOARD')} className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-icons-round text-2xl">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{articleId ? 'Edit Article' : 'New Article'}</span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            Rwanda Women Magazine <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
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
                                <article className="font-serif text-lg md:text-xl leading-[1.8] text-slate-800 dark:text-slate-200 prose dark:prose-invert max-w-none">
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

                                <div className="editor-container rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner bg-slate-50/50 dark:bg-black/20">
                                    <ReactQuill
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        modules={modules}
                                        className="min-h-[400px]"
                                        placeholder="Start telling your story..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Sidebar Settings */}
                {!previewMode && (
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
                                                alert('URL copied to clipboard!');
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
                                    onClick={() => setShowMediaLibrary(true)}
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

                            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-4">
                                <span className="material-icons-round text-orange-500 text-lg">lightbulb</span>
                                <p className="text-[10px] text-orange-800/70 dark:text-orange-400/70 leading-relaxed font-medium">
                                    High-quality articles with clear headings and a featured image perform 80% better in engagement.
                                </p>
                            </div>
                        </div>
                    </aside>
                )}
            </main>

            {/* Media Library Modal */}
            {showMediaLibrary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Select Media</h3>
                            <button
                                onClick={() => setShowMediaLibrary(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <span className="material-icons text-slate-500">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <MediaLibrary
                                selectionMode={true}
                                onSelect={(url) => {
                                    setFeaturedImage(url);
                                    setShowMediaLibrary(false);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editor;