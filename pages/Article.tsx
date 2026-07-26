import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Article as ArticleType, Comment as CommentType } from '../types';
import api from '../services/api';
import SEO from '../components/SEO';
import { ArticleSkeleton } from '../components/Skeleton';
import { sanitizeArticleHtml } from '../utils/sanitize';
import { readingTimeMinutes } from '../utils/readingTime';
import ArticleHero from '../components/article/ArticleHero';
import ArticleSidebar from '../components/article/ArticleSidebar';
import ArticleComments from '../components/article/ArticleComments';
import CompactArticleCard from '../components/article/CompactArticleCard';
import AdSlot from '../components/article/AdSlot';

const Article: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<ArticleType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [relatedArticles, setRelatedArticles] = useState<ArticleType[]>([]);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);

    const progressRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    // Track progress through the article body itself, so the bar reads 100% when
    // the story ends rather than when the footer does.
    useEffect(() => {
        const handleScroll = () => {
            const body = bodyRef.current;
            const bar = progressRef.current;
            if (!body || !bar) return;

            const start = body.offsetTop;
            const readable = body.offsetHeight - window.innerHeight;
            const scrolled = window.scrollY - start;

            const progress = readable <= 0
                ? (window.scrollY >= start ? 100 : 0)
                : (scrolled / readable) * 100;

            bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [article]);

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
                    // Fetch related articles from same category. Over-fetch so the
                    // client-side self-filter still leaves enough to fill both the
                    // related grid and the sidebar rail.
                    if (articleData.category?.slug) {
                        try {
                            const relatedRes = await api.get(`/articles?category=${articleData.category.slug}&limit=8`);
                            setRelatedArticles(
                                relatedRes.data.articles.filter((a: ArticleType) => a.id !== articleData.id)
                            );
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

    const readingTime = useMemo(() => readingTimeMinutes(article?.content), [article?.content]);
    const sanitizedContent = useMemo(
        () => sanitizeArticleHtml(article?.content),
        [article?.content]
    );

    // Split the pool: the grid below the story gets the first three, the sidebar
    // rail gets the next four so the two never show the same headline twice.
    const furtherReading = relatedArticles.slice(0, 3);
    const moreStories = relatedArticles.slice(3, 7);

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
                <div
                    ref={progressRef}
                    className="h-full w-0 bg-primary transition-all duration-150 ease-out shadow-[0_0_10px_rgba(216,0,180,0.5)]"
                ></div>
            </div>

            <div className="mx-auto w-full max-w-screen-xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] px-4 sm:px-6 lg:px-8 3xl:px-12 pb-24">
                {/* No `items-start`: the aside must stretch to the full row height
                    so its sticky child can travel the length of the article. */}
                <div className="grid gap-10 xl:gap-14 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_352px]">
                    <main className="min-w-0">
                        <ArticleHero
                            article={article}
                            readingTime={readingTime}
                            commentCount={comments.length}
                        />

                        {/* The rail stacks at the bottom on small screens, so run an
                            inline unit here to keep coverage above the fold. */}
                        <AdSlot size="inline" placement="article-top-mobile" className="mt-8 lg:hidden" />

                        <article ref={bodyRef} className="pt-10">
                            <div
                                className="article-content prose prose-lg 3xl:prose-xl dark:prose-invert mx-auto max-w-[68ch] 3xl:max-w-[72ch] font-serif leading-relaxed text-slate-700 dark:text-slate-300 first-letter:text-5xl sm:first-letter:text-7xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left"
                                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                            />

                            {/* Topics */}
                            <div className="mx-auto max-w-[68ch] 3xl:max-w-[72ch] mt-14 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-full mb-2">
                                    Topics
                                </span>
                                <Link
                                    to={`/category/${article.category.slug}`}
                                    className="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all decoration-none uppercase tracking-widest"
                                >
                                    {article.category.name}
                                </Link>
                                {article.tags?.map((tag) => (
                                    <Link
                                        key={tag.id}
                                        to={`/search?q=${encodeURIComponent(tag.name)}`}
                                        className="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all decoration-none uppercase tracking-widest"
                                    >
                                        {tag.name}
                                    </Link>
                                ))}
                            </div>
                        </article>

                        <AdSlot size="inline" placement="article-end" className="mt-14" />

                        {/* Related Articles */}
                        {furtherReading.length > 0 && (
                            <section className="mt-16">
                                <div className="flex items-center gap-4 mb-10">
                                    <h2 className="font-display text-2xl md:text-3xl font-black italic uppercase tracking-tight whitespace-nowrap">
                                        Further <span className="text-primary">Reading</span>
                                    </h2>
                                    <div className="flex-grow h-[1px] bg-gray-200 dark:bg-gray-800"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {furtherReading.map((rel) => (
                                        <CompactArticleCard key={rel.id} article={rel} variant="card" />
                                    ))}
                                </div>
                            </section>
                        )}

                        <ArticleComments
                            articleId={article.id}
                            comments={comments}
                            isLoading={isCommentsLoading}
                        />
                    </main>

                    <aside className="min-w-0" aria-label="More from Rwanda Women Magazine">
                        <ArticleSidebar author={article.author} moreStories={moreStories} />
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Article;
