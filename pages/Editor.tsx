import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { PageView, Article } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MediaLibrary from '../components/MediaLibrary';

interface EditorProps {
    navigate: (page: PageView, id?: string) => void;
    articleId?: string | null;
}

interface Category {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

const Editor: React.FC<EditorProps> = ({ navigate, articleId }) => {
    const { user } = useAuth();
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
                    setTags(art.tags?.map((t: any) => t.id) || []);
                    setIsFeatured(art.isFeatured);
                    setStatus(art.status);


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
        const editorContent = content;

        const payload = {
            title,
            excerpt,
            content: editorContent,
            featuredImage,
            categoryId: Number(categoryId),
            tags,
            isFeatured,
            status: isPublish ? 'published' : (articleId ? status : 'draft')
        };

        try {
            if (articleId) {
                await api.put(`/articles/${articleId}`, payload);
                if (isPublish && status !== 'published') {
                    await api.patch(`/articles/${articleId}/status`, { status: 'published' });
                }
            } else {
                const res = await api.post('/articles', payload);
                if (isPublish) {
                    await api.patch(`/articles/${res.data.id}/status`, { status: 'published' });
                }
            }
            navigate('DASHBOARD');
        } catch (error) {
            console.error('Failed to save article:', error);
            alert('Failed to save article');
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
                        disabled={isSaving}
                        onClick={() => handleSave(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        disabled={isSaving}
                        onClick={() => handleSave(true)}
                        className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                    >
                        {articleId && status === 'published' ? 'Update' : 'Publish'}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Editor Area */}
                <section className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#2a1225] shadow-sm m-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 overflow-y-auto px-8 md:px-24 py-12">
                        <div className="max-w-3xl mx-auto">
                            <textarea
                                className="w-full bg-transparent text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 border-none focus:ring-0 resize-none overflow-hidden p-0 mb-4 leading-tight"
                                rows={1}
                                placeholder="Article Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <textarea
                                className="w-full bg-transparent text-lg text-slate-500 italic placeholder-slate-300 dark:placeholder-slate-600 border-none focus:ring-0 resize-none overflow-hidden p-0 mb-8"
                                rows={2}
                                placeholder="Write a short excerpt..."
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                            />

                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                className="mb-12"
                                placeholder="Start writing your story here..."
                            />
                        </div>
                    </div>
                </section>

                {/* Sidebar Settings */}
                <aside className="w-80 bg-background-light dark:bg-background-dark border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-y-auto shadow-inner">
                    <div className="p-5 space-y-8">
                        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Publication</h3>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${status === 'published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                    }`}>{status}</span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Author</label>
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
                                        <div className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                                            {user?.fullName?.charAt(0) || 'A'}
                                        </div>
                                        <span className="text-sm">{user?.fullName || 'Active Author'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    <select
                                        title="Select category"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(Number(e.target.value))}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isFeatured"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Feature on homepage</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Featured Image URL</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                                    value={featuredImage}
                                    onChange={(e) => setFeaturedImage(e.target.value)}
                                />
                                <div className="w-full aspect-video bg-slate-100 dark:bg-surface-dark border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center overflow-hidden relative group"
                                    onClick={() => setShowMediaLibrary(true)}
                                >
                                    {featuredImage ? (
                                        <>
                                            <img src={featuredImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded">Change Image</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center cursor-pointer">
                                            <span className="material-icons text-slate-300 text-3xl">image</span>
                                            <span className="text-xs text-slate-400 mt-2">Select Image</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tags</h3>
                            <div className="bg-white dark:bg-surface-dark p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${tags.includes(tag.id)
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            #{tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
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