import React from 'react';
import type { EditorImagesApi, ImageAlign } from './useEditorImages';

/**
 * Controls for the image the author has clicked.
 *
 * Rendered as a bar above the editor rather than floating over the image: a
 * floating popover has to be positioned against a scrolling container and gets
 * clipped at the edges, and none of that buys the author anything here.
 */

const ALIGNMENTS: { value: ImageAlign; icon: string; label: string }[] = [
    { value: 'left', icon: 'format_align_left', label: 'Align left' },
    { value: 'center', icon: 'format_align_center', label: 'Align centre' },
    { value: 'right', icon: 'format_align_right', label: 'Align right' },
];

const WIDTHS = [
    { value: '50%', label: 'S' },
    { value: '75%', label: 'M' },
    { value: '', label: 'Full' },
];

const ImageToolbar: React.FC<{ images: EditorImagesApi }> = ({ images }) => {
    const { selected } = images;
    if (!selected) return null;

    const buttonClass = (active: boolean) =>
        `p-1.5 rounded-lg transition-colors ${active
            ? 'bg-primary text-white'
            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10'}`;

    return (
        <div className="sticky top-0 z-20 mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 backdrop-blur animate-fade-in">
            <span className="material-icons-round text-primary text-lg">image</span>

            <div className="flex items-center gap-1">
                {ALIGNMENTS.map(({ value, icon, label }) => (
                    <button
                        key={value}
                        type="button"
                        title={label}
                        aria-label={label}
                        aria-pressed={selected.align === value}
                        onClick={() => images.setAlign(value)}
                        className={buttonClass(selected.align === value)}
                    >
                        <span className="material-icons-round text-lg">{icon}</span>
                    </button>
                ))}
            </div>

            <div className="h-5 w-px bg-primary/20" />

            <div className="flex items-center gap-1">
                {WIDTHS.map(({ value, label }) => (
                    <button
                        key={label}
                        type="button"
                        title={`Width ${label}`}
                        aria-label={`Width ${label}`}
                        aria-pressed={selected.width === value}
                        onClick={() => images.setWidth(value)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${selected.width === value
                            ? 'bg-primary text-white'
                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="h-5 w-px bg-primary/20" />

            {/* Alt text is the accessibility story and the SEO story at once, so
                it gets a real field rather than being buried in a dialog. */}
            <input
                type="text"
                value={selected.alt}
                onChange={(e) => images.setAlt(e.target.value)}
                placeholder="Describe this image (alt text)"
                aria-label="Image alt text"
                className="min-w-0 flex-1 rounded-lg border-none bg-white/70 px-3 py-1.5 text-xs text-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-primary/40 dark:bg-black/30 dark:text-slate-300"
            />

            <button
                type="button"
                title="Remove image"
                aria-label="Remove image"
                onClick={images.remove}
                className="p-1.5 rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            >
                <span className="material-icons-round text-lg">delete_outline</span>
            </button>
        </div>
    );
};

export default ImageToolbar;
