import React, { useState, useEffect, useCallback } from 'react';
import { PageView, Article as ArticleType } from '../types';
import api from '../services/api';

interface ArticleProps {
    navigate: (page: PageView, id?: string) => void;
    articleId?: string | null;
}

const Article: React.FC<ArticleProps> = ({ navigate, articleId }) => {
    const [article, setArticle] = useState<ArticleType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Comments state
    const [comments, setComments] = useState<any[]>([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '' });
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentFeedback, setCommentFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const fetchComments = useCallback(async (id: string) => {
        setIsCommentsLoading(true);
        try {
            const response = await api.get(`/comments/${id}?approved=true`);
            setComments(response.data || []);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setIsCommentsLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!articleId) {
                setError('Article not found');
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get(`/articles/id/${articleId}`);
                setArticle(response.data);
                fetchComments(articleId);
            } catch (err) {
                console.error('Failed to fetch article:', err);
                setError('Failed to load article');
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [articleId, fetchComments]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!articleId || isSubmittingComment) return;

        setIsSubmittingComment(true);
        setCommentFeedback(null);

        try {
            await api.post(`/comments/${articleId}`, commentForm);
            setCommentFeedback({
                type: 'success',
                msg: 'Thank you! Your comment has been submitted and is awaiting moderation.'
            });
            setCommentForm({ name: '', email: '', comment: '' });
        } catch (err) {
            setCommentFeedback({
                type: 'error',
                msg: 'Failed to post comment. Please try again.'
            });
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Loading Article...</p>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Article Not Found</h2>
                    <button onClick={() => navigate('HOME')} className="text-primary hover:underline">
                        Go back home
                    </button>
                </div>
            </div>
        );
    }

    const fallbackImage = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2938&auto=format&fit=crop";

    return (
        <div className="animate-fade-in focus:outline-none">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-[1001]">
                <div className="h-full bg-primary w-[35%] shadow-[0_0_10px_rgba(214,0,178,0.5)] transition-all duration-300"></div>
            </div>

            {/* Hero Section */}
            <header className="relative w-full h-[70vh] min-h-[500px] flex items-end justify-center pb-20">
                <div className="absolute inset-0 z-0">
                    <img src={article.featuredImage || fallbackImage} alt={article.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent opacity-90"></div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
                    <div className="inline-block px-3 py-1 mb-6 border border-white/30 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium uppercase tracking-widest text-primary-light">
                        {article.category?.name || 'News'}
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 drop-shadow-lg">
                        {article.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 font-serif max-w-2xl mx-auto leading-relaxed mb-8">
                        {article.excerpt}
                    </p>
                    <div className="flex items-center justify-center space-x-6 text-sm font-medium text-gray-300">
                        <div className="flex items-center">
                            {article.author?.profileImage ? (
                                <img src={article.author.profileImage} className="w-8 h-8 rounded-full mr-3 object-cover" alt={article.author.fullName} />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold mr-3">{article.author?.fullName?.charAt(0) || 'A'}</div>
                            )}
                            <span>By <span className="text-white border-b border-primary/50 pb-0.5">{article.author?.fullName || 'Unknown'}</span></span>
                        </div>
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </header>

            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Share Sidebar */}
                    <aside className="hidden lg:block lg:col-span-2 relative">
                        <div className="sticky top-32 flex flex-col space-y-6 items-center lg:items-end pr-4 border-r border-gray-100 dark:border-gray-800">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 rotate-90 origin-right translate-x-3 mb-8">Share</span>
                            <button className="w-10 h-10 rounded-full bg-white dark:bg-white/5 shadow-sm hover:shadow-md hover:bg-blue-600 hover:text-white transition-all text-gray-400 border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                                <span className="material-icons text-sm">facebook</span>
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white dark:bg-white/5 shadow-sm hover:shadow-md hover:bg-sky-500 hover:text-white transition-all text-gray-400 border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                                <span className="material-icons text-sm">share</span>
                            </button>
                        </div>
                    </aside>

                    {/* Article Body */}
                    <article className="col-span-1 lg:col-span-8 font-serif text-lg leading-loose text-gray-800 dark:text-gray-300 space-y-8">
                        <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
                    </article>
                </div>

                {/* Author Info */}
                <div className="max-w-4xl mx-auto mt-16 border-t border-gray-200 dark:border-gray-800 pt-16">
                    <div className="bg-white dark:bg-white/5 p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="shrink-0 relative">
                            {article.author?.profileImage ? (
                                <img src={article.author.profileImage} className="w-24 h-24 rounded-full object-cover border-4 border-background-light dark:border-background-dark shadow-md" alt={article.author.fullName} />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">{article.author?.fullName?.charAt(0)}</div>
                            )}
                            <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-background-dark">
                                <span className="material-icons text-xs block">verified</span>
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">About {article.author?.fullName}</h3>
                            <p className="font-sans text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                                {article.author?.bio || "Writer for Rwanda Women Magazine. Covering stories that matter."}
                            </p>
                            <div className="flex justify-center md:justify-start space-x-4 text-sm font-medium">
                                <button className="text-gray-400 hover:text-primary transition-colors cursor-pointer">Follow</button>
                                <span className="text-gray-300">•</span>
                                <button onClick={() => navigate('HOME')} className="text-gray-400 hover:text-primary transition-colors cursor-pointer">More Articles</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments */}
                <section className="max-w-4xl mx-auto mt-20 pt-16 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">Comments ({comments.length})</h2>
                        <span className="text-gray-400 text-sm font-sans">Moderated Community</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-2xl mb-16 border border-primary/5 dark:border-primary/10">
                        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">Share your thoughts</h3>
                        <form className="space-y-6" onSubmit={handleCommentSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary text-gray-900 dark:text-white transition-colors"
                                        placeholder="Full Name"
                                        value={commentForm.name}
                                        onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                                        disabled={isSubmittingComment}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary text-gray-900 dark:text-white transition-colors"
                                        placeholder="email@example.com"
                                        value={commentForm.email}
                                        onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                                        disabled={isSubmittingComment}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Comment</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary text-gray-900 dark:text-white transition-colors"
                                    placeholder="Write your comment here..."
                                    value={commentForm.comment}
                                    onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                                    disabled={isSubmittingComment}
                                ></textarea>
                            </div>

                            {commentFeedback && (
                                <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${commentFeedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    <span className="material-icons">{commentFeedback.type === 'success' ? 'check_circle' : 'error'}</span>
                                    {commentFeedback.msg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmittingComment}
                                className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
                            >
                                {isSubmittingComment && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                Post Comment
                            </button>
                        </form>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-8">
                        {isCommentsLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                            </div>
                        ) : comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-6 animate-fade-in group">
                                    <div className="shrink-0">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-xl shadow-md uppercase">
                                            {comment.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{comment.name}</h4>
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 group-hover:border-primary/20 transition-colors shadow-sm">
                                            {comment.comment}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                                <span className="material-icons text-5xl text-gray-300 dark:text-gray-700 mb-4 block">chat_bubble_outline</span>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No comments yet</h3>
                                <p className="text-gray-500 max-w-xs mx-auto text-sm">Be the first to share your thoughts.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Article;