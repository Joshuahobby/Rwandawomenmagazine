import React from 'react';
import type { Article } from '../../types';
import AdSlot from './AdSlot';
import AuthorCard from './AuthorCard';
import NewsletterCard from './NewsletterCard';
import CompactArticleCard from './CompactArticleCard';

interface ArticleSidebarProps {
    author: Article['author'];
    /** Stories for the "More Stories" rail — already filtered of the current article. */
    moreStories: Article[];
}

/**
 * The right-hand rail. Below `lg` it stacks under the article, which is why an
 * inline ad also runs inside the article flow.
 *
 * Only the trailing ad is sticky, not the whole rail: the full stack is taller
 * than a typical viewport, and a sticky element that overflows the screen pins
 * its top and leaves its bottom permanently unreachable. Letting the editorial
 * blocks scroll normally and pinning one short unit gives the rail presence for
 * the whole length of a long article without hiding anything.
 */
const ArticleSidebar: React.FC<ArticleSidebarProps> = ({ author, moreStories }) => {
    return (
        <>
            <div className="space-y-8">
                <AdSlot size="rectangle" placement="sidebar-top" />

                <AuthorCard author={author} />

                {moreStories.length > 0 && (
                    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">
                            More Stories
                        </h3>
                        <div className="space-y-5">
                            {moreStories.map((story) => (
                                <CompactArticleCard key={story.id} article={story} />
                            ))}
                        </div>
                    </section>
                )}

                <NewsletterCard />
            </div>

            <AdSlot
                size="halfpage"
                placement="sidebar-bottom"
                className="hidden lg:block mt-8 lg:sticky lg:top-24"
            />
        </>
    );
};

export default ArticleSidebar;
