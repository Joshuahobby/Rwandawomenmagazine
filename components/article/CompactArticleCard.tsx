import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../../types';
import { optimizeImage } from '../../utils/image';

interface CompactArticleCardProps {
    article: Article;
    /**
     * row  — thumbnail beside the title, for narrow sidebar rails
     * card — image above the title, for multi-column grids
     */
    variant?: 'row' | 'card';
}

/**
 * The shared small-article card. Used by the sidebar "More Stories" rail and by
 * the related-articles grid so both stay in sync.
 */
const CompactArticleCard: React.FC<CompactArticleCardProps> = ({ article, variant = 'row' }) => {
    if (variant === 'card') {
        return (
            <Link to={`/article/${article.slug}`} className="group block text-inherit decoration-none">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-4 bg-slate-100 dark:bg-slate-800">
                    <img
                        src={optimizeImage(article.featuredImage, 600, 450)}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    {article.category?.name}
                </span>
                <h4 className="font-display text-lg font-bold leading-tight mt-1 group-hover:text-primary transition-colors">
                    {article.title}
                </h4>
            </Link>
        );
    }

    return (
        <Link
            to={`/article/${article.slug}`}
            className="group flex items-start gap-4 text-inherit decoration-none"
        >
            <div className="w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <img
                    src={optimizeImage(article.featuredImage, 160, 160)}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    {article.category?.name}
                </span>
                <h4 className="font-display text-sm font-bold leading-snug mt-1 line-clamp-3 group-hover:text-primary transition-colors">
                    {article.title}
                </h4>
            </div>
        </Link>
    );
};

export default CompactArticleCard;
