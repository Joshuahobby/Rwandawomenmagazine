import React from 'react';

/**
 * The API has accepted `seo: { metaTitle, metaDescription, ogImage, keywords }`
 * since the article schema was written, and `getArticleById` returns `seoMeta`
 * — the editor simply never read or wrote any of it, so every article shipped
 * with whatever Google inferred from the body.
 */

export interface SeoFields {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
}

export const EMPTY_SEO: SeoFields = { metaTitle: '', metaDescription: '', keywords: '', ogImage: '' };

/** Google truncates around these; over is not invalid, just cut off in results. */
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

const Counter: React.FC<{ value: string; limit: number }> = ({ value, limit }) => (
    <span className={`text-[9px] font-bold tabular-nums ${value.length > limit ? 'text-orange-500' : 'text-slate-400'}`}>
        {value.length}/{limit}
    </span>
);

interface SeoPanelProps {
    seo: SeoFields;
    onChange: (seo: SeoFields) => void;
    /** Falls back into the preview when the SEO overrides are blank. */
    fallbackTitle: string;
    fallbackDescription: string;
    slug: string;
}

const SeoPanel: React.FC<SeoPanelProps> = ({ seo, onChange, fallbackTitle, fallbackDescription, slug }) => {
    const set = (patch: Partial<SeoFields>) => onChange({ ...seo, ...patch });

    const previewTitle = seo.metaTitle || fallbackTitle || 'Untitled Article';
    const previewDescription = seo.metaDescription || fallbackDescription || 'No description yet.';

    return (
        <div className="bg-white dark:bg-[#1a0b16] p-5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-5">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Search &amp; Social</h3>

            {/* Showing the result the way Google does makes the character limits
                mean something instead of being abstract numbers. */}
            <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-black/20 p-3">
                <p className="text-[10px] text-slate-400 truncate">rwandawomenmagazine.rw › {slug || 'article'}</p>
                <p className="text-[13px] leading-snug text-[#1a0dab] dark:text-blue-400 line-clamp-2">{previewTitle}</p>
                <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">{previewDescription}</p>
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="seo-title" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Meta Title</label>
                    <Counter value={seo.metaTitle} limit={TITLE_LIMIT} />
                </div>
                <input
                    id="seo-title"
                    type="text"
                    value={seo.metaTitle}
                    onChange={(e) => set({ metaTitle: e.target.value })}
                    placeholder={fallbackTitle || 'Defaults to the article title'}
                    className="w-full rounded-xl border-slate-100 bg-slate-50 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:border-white/5 dark:bg-black/40"
                />
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="seo-description" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Meta Description</label>
                    <Counter value={seo.metaDescription} limit={DESCRIPTION_LIMIT} />
                </div>
                <textarea
                    id="seo-description"
                    rows={3}
                    value={seo.metaDescription}
                    onChange={(e) => set({ metaDescription: e.target.value })}
                    placeholder={fallbackDescription || 'Defaults to the excerpt'}
                    className="w-full resize-none rounded-xl border-slate-100 bg-slate-50 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:border-white/5 dark:bg-black/40"
                />
            </div>

            <div>
                <label htmlFor="seo-keywords" className="mb-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Keywords</label>
                <input
                    id="seo-keywords"
                    type="text"
                    value={seo.keywords}
                    onChange={(e) => set({ keywords: e.target.value })}
                    placeholder="women in tech, rwanda, entrepreneurship"
                    className="w-full rounded-xl border-slate-100 bg-slate-50 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:border-white/5 dark:bg-black/40"
                />
            </div>

            <div>
                <label htmlFor="seo-og" className="mb-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Social Share Image</label>
                <input
                    id="seo-og"
                    type="text"
                    value={seo.ogImage}
                    onChange={(e) => set({ ogImage: e.target.value })}
                    placeholder="Defaults to the featured image"
                    className="w-full rounded-xl border-slate-100 bg-slate-50 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:border-white/5 dark:bg-black/40"
                />
            </div>
        </div>
    );
};

export default SeoPanel;
