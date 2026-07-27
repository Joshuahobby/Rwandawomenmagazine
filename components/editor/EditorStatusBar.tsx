import React from 'react';
import { readingTimeMinutes } from '../../utils/readingTime';

/**
 * Word count, reading time and save state — the three things a writer glances
 * at without wanting to leave the page. Reading time reuses the same helper the
 * article page displays, so the editor and the published piece never disagree.
 */

export function countWords(html: string | null | undefined): number {
    if (!html) return 0;
    const text = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .trim();
    return text ? text.split(/\s+/).length : 0;
}

function relativeTime(timestamp: number): string {
    const seconds = Math.round((Date.now() - timestamp) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.round(minutes / 60)}h ago`;
}

interface EditorStatusBarProps {
    content: string;
    isDirty: boolean;
    isSaving: boolean;
    draftSavedAt: number | null;
    uploading: number;
}

const EditorStatusBar: React.FC<EditorStatusBarProps> = ({ content, isDirty, isSaving, draftSavedAt, uploading }) => {
    const words = countWords(content);

    const status = isSaving
        ? { icon: 'sync', text: 'Saving…', className: 'text-orange-500' }
        : uploading > 0
            ? { icon: 'cloud_upload', text: `Uploading ${uploading} image${uploading > 1 ? 's' : ''}…`, className: 'text-primary' }
            : isDirty
                ? {
                    icon: 'edit_note',
                    text: draftSavedAt ? `Draft recovered locally · ${relativeTime(draftSavedAt)}` : 'Unsaved changes',
                    className: 'text-slate-500',
                }
                : { icon: 'check_circle', text: 'All changes saved', className: 'text-green-600 dark:text-green-400' };

    return (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 px-6 py-2.5 text-[11px] font-medium text-slate-500 dark:border-white/5 dark:text-slate-400">
            <span className={`flex items-center gap-1.5 ${status.className}`}>
                <span className={`material-icons-round text-sm ${isSaving || uploading > 0 ? 'animate-spin' : ''}`}>{status.icon}</span>
                {status.text}
            </span>
            <span className="tabular-nums">{words.toLocaleString()} {words === 1 ? 'word' : 'words'}</span>
            <span className="tabular-nums">{readingTimeMinutes(content)} min read</span>
        </div>
    );
};

export default EditorStatusBar;
