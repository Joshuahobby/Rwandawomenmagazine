import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Keeps a local copy of the working draft and warns before it would be lost.
 *
 * Deliberately localStorage and not the API: an author who is offline, lacks
 * publish rights, or is mid-sentence should not have partial work written to a
 * shared record. This is a crash/tab-close net, not a save.
 */

const KEY_PREFIX = 'rwanda_women_draft:';
/** Long enough to survive a browser restart, short enough not to haunt an author. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface StoredDraft<T> {
    savedAt: number;
    data: T;
}

export function draftKey(articleId: string | undefined): string {
    return `${KEY_PREFIX}${articleId || 'new'}`;
}

export function readDraft<T>(articleId: string | undefined): StoredDraft<T> | null {
    try {
        const raw = localStorage.getItem(draftKey(articleId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredDraft<T>;
        if (!parsed?.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
            localStorage.removeItem(draftKey(articleId));
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export function clearDraft(articleId: string | undefined): void {
    try {
        localStorage.removeItem(draftKey(articleId));
    } catch {
        /* storage disabled or full — nothing useful to do */
    }
}

export interface AutosaveState {
    savedAt: number | null;
    /** True when the document differs from what was last written to the server. */
    isDirty: boolean;
    markClean: () => void;
}

export function useAutosave<T>(
    articleId: string | undefined,
    data: T,
    options: { enabled: boolean; intervalMs?: number } = { enabled: true },
): AutosaveState {
    const { enabled, intervalMs = 3000 } = options;
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    // The baseline is what the server last accepted; everything since is dirty.
    const baselineRef = useRef<string>(JSON.stringify(data));
    const dataRef = useRef(data);
    dataRef.current = data;

    const markClean = useCallback(() => {
        baselineRef.current = JSON.stringify(dataRef.current);
        setIsDirty(false);
        clearDraft(articleId);
        setSavedAt(null);
    }, [articleId]);

    useEffect(() => {
        if (!enabled) return;
        const timer = setInterval(() => {
            const serialized = JSON.stringify(dataRef.current);
            if (serialized === baselineRef.current) {
                setIsDirty(false);
                return;
            }
            setIsDirty(true);
            try {
                localStorage.setItem(
                    draftKey(articleId),
                    JSON.stringify({ savedAt: Date.now(), data: dataRef.current }),
                );
                setSavedAt(Date.now());
            } catch {
                // A full or disabled localStorage must not break typing.
            }
        }, intervalMs);
        return () => clearInterval(timer);
    }, [articleId, enabled, intervalMs]);

    // The browser's own confirmation dialog is the only thing that can stop a
    // tab close, so route the dirty flag into it.
    useEffect(() => {
        if (!isDirty) return;
        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    return { savedAt, isDirty, markClean };
}
