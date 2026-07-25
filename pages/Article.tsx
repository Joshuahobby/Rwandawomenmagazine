import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Article as ArticleType, Comment as CommentType } from '../types';
import api from '../services/api';
import SEO from '../components/SEO';
import { ArticleSkeleton } from '../components/Skeleton';
import { optimizeImage } from '../utils/image';
import { sanitizeArticleHtml } from '../utils/sanitize';

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
                // Remove trailing slash if present
                const cleanSlug = slug?.replace(/\/$/, '');
                const response = await api.get(`/articles/${cleanSlug}`);
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
        return <ArticleSkeleton />;
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

    return (
        <div className="animate-fade-in focus:outline-none">
            <SEO 
                title={article.title}
                description={article.excerpt || undefined}
                image={article.featuredImage || undefined}
                type="article"
                author={article.author?.fullName}
                url={`https://rwandawomenmagazine.rw/article/${article.slug}`}
            />
            
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-gray-200 dark:bg-gray-800">
                <div ref={progressRef} className="h-full bg-primary transition-all duration-150 ease-out shadow-[0_0_10px_rgba(235,64,136,0.5)]"></div>
            </div>

            {/* Article Hero Section */}
            <section className="relative w-full">
                {/* Featured Image - shown in full, never cropped */}
                <div className="relative w-full" style={{ maxHeight: '75vh' }}>
                    <img 
                        src={optimizeImage(article.featuredImage, 1920)} 
                        alt={article.title}
                        className="w-full h-auto block"
                        style={{ maxHeight: '75vh', width: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    />
                    {/* Strong gradient overlay for title readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/85"></div>
                </div>
                
                {/* Title overlay positioned at bottom of image */}
                <div className="absolute bottom-0 left-0 right-0 pb-10 md:pb-16 pt-20">
                    <div className="max-w-4xl mx-auto px-6 md:px-8 w-full text-white text-center">
                        <Link to={`/category/${article.category.slug}`} className="inline-block px-5 py-2 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-widest mb-5 hover:bg-primary-dark transition-colors decoration-none shadow-lg">
                            {article.category.name}
                        </Link>
                        <h1 
                            className="font-display text-3xl md:text-5xl lg:text-6xl font-black leading-[1.15] mb-5 tracking-tight"
                            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 4px 24px rgba(0,0,0,0.5)' }}
                        >
                            {article.title}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                            <div className="flex items-center gap-2">
                                <span className="material-icons text-primary text-lg">person</span>
                                <span className="uppercase tracking-widest text-xs md:text-sm">{article.author?.fullName || 'Rwanda Women Editorial'}</span>
                            </div>
                            <div className="w-1 h-1 bg-white/50 rounded-full hidden md:block"></div>
                            <div className="flex items-center gap-2">
                                <span className="material-icons text-primary text-lg">schedule</span>
                                <span className="uppercase tracking-widest text-xs md:text-sm">{new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-12 relative z-10 pb-24">
                <article className="bg-white dark:bg-slate-900 shadow-2xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 lg:p-16 overflow-hidden">
                    <div 
                        className="article-content prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed text-slate-700 dark:text-slate-300 first-letter:text-7xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left"
                        dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
                    />
                    
                    {/* Tags / Meta */}
                    <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-full mb-2">Topics</span>
                        <Link to={`/category/${article.category.slug}`} className="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all decoration-none uppercase tracking-widest">
                            {article.category.name}
                        </Link>
                    </div>
                </article>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <section className="mt-24">
                        <div className="flex items-center gap-4 mb-10">
                            <h3 className="font-display text-3xl font-black italic uppercase tracking-tight">Further <span className="text-primary">Reading</span></h3>
                            <div className="flex-grow h-[1px] bg-gray-200 dark:bg-gray-800"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedArticles.map((rel) => (
                                <Link key={rel.id} to={`/article/${rel.slug}`} className="group block text-inherit decoration-none">
                                    <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-4 bg-gray-100 dark:bg-gray-800">
                                        <img 
                                            src={optimizeImage(rel.featuredImage, 600, 450)} 
                                            alt={rel.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <h4 className="font-display text-lg font-bold leading-tight group-hover:text-primary transition-colors italic">
                                        {rel.title}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Comments Section */}
                <section className="mt-24 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-8 md:p-16 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="font-display text-3xl font-black italic uppercase tracking-tight">Narrative <span className="text-primary">Dialogue</span></h3>
                        <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold tracking-widest border border-primary/20">
                            {comments.length} COMMENTS
                        </span>
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="space-y-6 mb-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-4">Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Jane Doe"
                                    className="w-full bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 rounded-full px-6 py-4 focus:border-primary outline-none transition-all font-medium"
                                    value={commentForm.name}
                                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-4">Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="jane@example.com"
                                    className="w-full bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 rounded-full px-6 py-4 focus:border-primary outline-none transition-all font-medium"
                                    value={commentForm.email}
                                    onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-4">Your Perspective</label>
                            <textarea 
                                rows={5}
                                placeholder="Share your thoughts on this narrative..."
                                className="w-full bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 rounded-[2rem] px-8 py-6 focus:border-primary outline-none transition-all font-medium resize-none"
                                value={commentForm.comment}
                                onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            {commentFeedback && (
                                <p className={`text-sm font-bold tracking-tight italic ${commentFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                    {commentFeedback.msg}
                                </p>
                            )}
                            <button 
                                type="submit"
                                disabled={isSubmittingComment}
                                className="ml-auto bg-primary text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {isSubmittingComment ? 'SUBMITTING...' : 'POST COMMENT'}
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-8">
                        {isCommentsLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : comments.length > 0 ? (
                            comments.map((c) => (
                                <div key={c.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-50 dark:border-gray-700 animate-fade-in">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-primary font-bold text-xl uppercase">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h5 className="font-bold tracking-tight text-slate-800 dark:text-slate-100">{c.name}</h5>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{new Date(c.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">{c.comment}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400 font-serif italic">
                                Be the first to join the dialogue on this story.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Article;