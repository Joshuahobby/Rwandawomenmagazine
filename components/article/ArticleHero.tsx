import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../../types';
import { optimizeImage, buildSrcSet } from '../../utils/image';

interface ArticleHeroProps {
    article: Article;
    readingTime: number;
    commentCount: number;
}

/**
 * Headline first, image second.
 *
 * The image sits in a fixed-aspect frame so it reserves its space before it
 * loads and never grows tall enough to swallow the fold. Keeping the title off
 * the photo means full text contrast at every size, and a long headline simply
 * pushes the image down instead of overflowing it.
 */
const ArticleHero: React.FC<ArticleHeroProps> = ({ article, readingTime, commentCount }) => {
    const publishedDate = new Date(article.publishedAt || article.createdAt);

    return (
        <>
            <header className="pt-6 lg:pt-10 pb-8">
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-5"
                >
                    <Link to="/" className="hover:text-primary transition-colors decoration-none">
                        Home
                    </Link>
                    <span aria-hidden="true">/</span>
                    <Link
                        to={`/category/${article.category.slug}`}
                        className="hover:text-primary transition-colors decoration-none"
                    >
                        {article.category.name}
                    </Link>
                </nav>

                <Link
                    to={`/category/${article.category.slug}`}
                    className="inline-block px-5 py-2 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-colors decoration-none"
                >
                    {article.category.name}
                </Link>

                <h1 className="font-display font-black tracking-tight text-balance text-3xl sm:text-4xl lg:text-5xl 3xl:text-6xl leading-[1.15] mt-5 mb-4 text-slate-900 dark:text-white">
                    {article.title}
                </h1>

                {article.excerpt && (
                    <p className="font-serif text-lg lg:text-xl 3xl:text-2xl leading-relaxed text-slate-600 dark:text-slate-400 mb-6 max-w-[60ch]">
                        {article.excerpt}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-600 dark:text-slate-400 pt-5 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                        {article.author?.profileImage ? (
                            <img
                                src={optimizeImage(article.author.profileImage, 64, 64)}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <span className="material-icons text-primary text-lg" aria-hidden="true">
                                person
                            </span>
                        )}
                        <span>{article.author?.fullName || 'Rwanda Women Editorial'}</span>
                    </div>

                    <time dateTime={publishedDate.toISOString()} className="flex items-center gap-2">
                        <span className="material-icons text-primary text-lg" aria-hidden="true">
                            calendar_today
                        </span>
                        {publishedDate.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </time>

                    <span className="flex items-center gap-2">
                        <span className="material-icons text-primary text-lg" aria-hidden="true">
                            schedule
                        </span>
                        {readingTime} min read
                    </span>

                    {commentCount > 0 && (
                        <span className="flex items-center gap-2">
                            <span className="material-icons text-primary text-lg" aria-hidden="true">
                                chat_bubble_outline
                            </span>
                            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                        </span>
                    )}
                </div>
            </header>

            <figure className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-slate-100 dark:bg-slate-800 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9]">
                <img
                    src={optimizeImage(article.featuredImage, 1440)}
                    srcSet={buildSrcSet(article.featuredImage)}
                    sizes="(min-width: 1024px) 900px, 100vw"
                    alt={article.title}
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </figure>
        </>
    );
};

export default ArticleHero;
