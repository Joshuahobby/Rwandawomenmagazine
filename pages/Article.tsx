import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Article as ArticleType, Comment as CommentType } from '../types';
import api from '../services/api';

interface ArticleProps {
}

const Article: React.FC<ArticleProps> = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<ArticleType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [relatedArticles, setRelatedArticles] = useState<ArticleType[]>([]);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '' });
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentFeedback, setCommentFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [readingProgress, setReadingProgress] = useState(0);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.style.width = `${readingProgress}%`;
        }
    }, [readingProgress]);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight === 0) return;
            const progress = (window.scrollY / totalHeight) * 100;
            setReadingProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchComments = useCallback(async (articleId: string) => {
        setIsCommentsLoading(true);
        try {
            const response = await api.get(`/comments/${articleId}?approved=true`);
            setComments(response.data || []);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setIsCommentsLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) {
                setError('Article not found');
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get(`/articles/${slug}`);
                const articleData = response.data;
                setArticle(articleData);
                if (articleData.id) {
                    fetchComments(articleData.id);
                    // Fetch related articles from same category
                    if (articleData.category?.slug) {
                        try {
                            const relatedRes = await api.get(`/articles?category=${articleData.category.slug}&limit=4`);
                            setRelatedArticles(relatedRes.data.articles.filter((a: ArticleType) => a.id !== articleData.id).slice(0, 3));
                        } catch (err) {
                            console.error('Failed to fetch related stories:', err);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch article:', err);
                setError('Failed to load article');
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [slug, fetchComments]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!article?.id || isSubmittingComment) return;

        setIsSubmittingComment(true);
        setCommentFeedback(null);

        try {
            await api.post(`/comments/${article.id}`, commentForm);
            setCommentFeedback({
                type: 'success',
                msg: 'Thank you! Your comment has been submitted and is awaiting moderation.'
            });
            setCommentForm({ name: '', email: '', comment: '' });
        } catch {
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
                    <Link to="/" className="text-primary hover:underline">
                        Go back home
                    </Link>
                </div>
            </div>
        );
    }

    const fallbackImage = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2938&auto=format&fit=crop";

    return (
        <div className="animate-fade-in focus:outline-none">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-[1001] bg-gray-100 dark:bg-gray-800">
                <div 
                    ref={progressRef}
                    className="h-full bg-primary shadow-[0_0_10px_rgba(214,0,178,0.5)] transition-all duration-150 ease-out"
                ></div>
            </div>

        <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <nav className="flex mb-8 text-xs font-medium text-gray-400 uppercase tracking-widest" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <Link to={`/category/${article.category?.slug}`} className="hover:text-primary transition-colors">{article.category?.name || 'News'}</Link>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-8 min-w-0">
                    {/* Article Title & Meta */}
                    <header className="mb-8">
                        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-gray-900 dark:text-white">
                            {article.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                            <div className="flex items-center">
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 mr-2">By</span>
                                <span className="text-gray-900 dark:text-white font-bold">{article.author?.fullName || 'Unknown'}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <div>
                                <span className="text-gray-900 dark:text-white">{new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <div>
                                <span className="text-gray-900 dark:text-white">5 min read</span>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    <div className="mb-12">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-100">
                            <img 
                                src={article.featuredImage || fallbackImage} 
                                alt={article.title} 
                                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" 
                            />
                        </div>
                        {article.excerpt && (
                            <div className="mt-10 p-8 bg-slate-50 dark:bg-white/5 rounded-2xl border-l-4 border-primary">
                                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-serif italic leading-relaxed">
                                    {article.excerpt}
                                </p>
                            </div>
                        )}
                    </div>

                    <article className="prose prose-sm md:prose-lg dark:prose-invert prose-primary max-w-none font-serif text-base md:text-lg leading-relaxed text-gray-800 dark:text-gray-300 overflow-hidden break-words">
                            <style>{`
                                .article-content p:first-of-type::first-letter {
                                    float: left;
                                    font-family: var(--font-display, 'Playfair Display', serif);
                                    font-size: 3.5rem;
                                    line-height: 3rem;
                                    padding-top: 0.25rem;
                                    padding-right: 0.5rem;
                                    font-weight: 700;
                                    color: #D600B2;
                                }
                                @media (min-width: 768px) {
                                    .article-content p:first-of-type::first-letter {
                                        font-size: 5.5rem;
                                        line-height: 4rem;
                                        padding-top: 0.5rem;
                                        padding-right: 0.75rem;
                                    }
                                }
                                .article-content img {
                                    border-radius: 1rem;
                                    margin-top: 2rem;
                                    margin-bottom: 2rem;
                                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
                                }
                                .article-content blockquote {
                                    border-left-color: #D600B2;
                                    font-style: italic;
                                    color: #4b5563;
                                    background: #f9fafb;
                                    padding: 1.5rem;
                                    margin: 2rem 0;
                                    border-radius: 0 1rem 1rem 0;
                                }
                            `}</style>
                            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content || '' }} />
                        </article>

                        {/* Social Share Inlined */}
                        <div className="mt-16 py-8 border-t border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 md:mb-0">Share this story</h4>
                            </div>
                            <div className="flex items-center gap-4">
                                <a 
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-blue-500/20"
                                    aria-label="Share on Facebook"
                                    title="Share on Facebook"
                                >
                                    <span className="material-icons text-xl">facebook</span>
                                </a>
                                <a 
                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-sky-500/20"
                                    aria-label="Share on X (Twitter)"
                                    title="Share on X (Twitter)"
                                >
                                    <span className="material-icons text-xl">share</span>
                                </a>
                                <a 
                                    href={`https://wa.me/?text=${encodeURIComponent(`${article.title} - ${window.location.href}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-green-500/20"
                                    aria-label="Share on WhatsApp"
                                    title="Share on WhatsApp"
                                >
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </a>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied to clipboard!');
                                    }}
                                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                    aria-label="Copy article link"
                                    title="Copy article link"
                                >
                                    <span className="material-icons text-xl">link</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="lg:col-span-4 space-y-12 lg:sticky lg:top-24 h-fit min-w-0">
                        {/* Premium Placement Ad */}
                        <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                            <span className="inline-block px-3 py-1 mb-4 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400">Advertisement</span>
                            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" alt="Ad Space" />
                            </div>
                            <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Partner with Rwanda Women Magazine</h4>
                            <p className="text-sm text-gray-500 mb-6">Reach over 50,000 monthly professional readers.</p>
                            <button className="w-full py-3 rounded-full bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary-dark transition-colors">Media Kit</button>
                        </div>

                        <div className="space-y-8">
                            <h3 className="font-display text-2xl font-bold flex items-center gap-3">
                                <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                    <span className="material-icons text-sm">trending_up</span>
                                </span>
                                Related Stories
                            </h3>
                            <div className="space-y-6">
                                {relatedArticles.length > 0 ? (
                                    relatedArticles.map((item) => (
                                        <Link 
                                            key={item.id} 
                                            to={`/article/${item.slug}`}
                                            className="flex gap-4 group cursor-pointer"
                                        >
                                            <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden">
                                                <img 
                                                    src={item.featuredImage || fallbackImage} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                    alt={item.title} 
                                                />
                                            </div>
                                            <div className="flex-1 py-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
                                                    {item.category?.name || 'Story'}
                                                </span>
                                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                    {item.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 mt-2 block uppercase tracking-widest">
                                                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    [1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-4 group animate-pulse">
                                            <div className="w-24 h-24 shrink-0 bg-gray-100 dark:bg-white/5 rounded-2xl"></div>
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-2 w-12 bg-gray-100 dark:bg-white/5 rounded"></div>
                                                <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded"></div>
                                                <div className="h-4 w-2/3 bg-gray-100 dark:bg-white/5 rounded"></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Newsletter Mini */}
                        <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                            <h4 className="text-2xl font-bold mb-4 relative z-10 font-display">Daily Intelligence</h4>
                            <p className="text-primary-light text-sm mb-6 relative z-10 leading-relaxed opacity-90">Get the best stories delivered directly to your inbox every morning.</p>
                            <div className="relative z-10 space-y-3">
                                <input type="email" placeholder="Email Address" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:bg-white/20 transition-all placeholder:text-white/50 text-sm" />
                                <button className="w-full bg-white text-primary font-bold py-3 rounded-xl text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-xl">Subscribe</button>
                            </div>
                        </div>
                    </aside>
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
            </div>
        </div>
    );
};

export default Article;