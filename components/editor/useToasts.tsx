import React, { useCallback, useMemo, useState } from 'react';

/**
 * Replaces the editor's `alert()` calls.
 *
 * `alert` blocks the whole page, cannot be styled, and — worse for an editor —
 * steals focus mid-typing. An upload failing in the background should tell the
 * author without interrupting the sentence they are writing.
 */

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    kind: ToastKind;
    message: string;
}

let nextId = 0;

export function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts(current => current.filter(t => t.id !== id));
    }, []);

    const push = useCallback((kind: ToastKind, message: string) => {
        const id = nextId++;
        setToasts(current => [...current, { id, kind, message }]);
        // Errors stay until dismissed; the author may need to act on them.
        if (kind !== 'error') {
            setTimeout(() => setToasts(current => current.filter(t => t.id !== id)), 4000);
        }
        return id;
    }, []);

    // Memoised as a whole, not just per function: callers put `notify` in
    // effect dependency arrays, and a fresh object each render re-runs those
    // effects forever.
    const notify = useMemo(() => ({
        success: (m: string) => push('success', m),
        error: (m: string) => push('error', m),
        info: (m: string) => push('info', m),
    }), [push]);

    return { toasts, notify, dismiss };
}

const STYLES: Record<ToastKind, { icon: string; className: string }> = {
    success: { icon: 'check_circle', className: 'border-green-500/30 bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300' },
    error: { icon: 'error_outline', className: 'border-red-500/30 bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300' },
    info: { icon: 'info', className: 'border-primary/30 bg-primary/5 text-primary' },
};

export const ToastStack: React.FC<{ toasts: Toast[]; onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex w-full max-w-sm flex-col gap-3" role="status" aria-live="polite">
            {toasts.map(toast => {
                const style = STYLES[toast.kind];
                return (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-fade-in-up ${style.className}`}
                    >
                        <span className="material-icons-round text-lg">{style.icon}</span>
                        <p className="flex-1 text-sm font-medium leading-snug whitespace-pre-line">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => onDismiss(toast.id)}
                            aria-label="Dismiss"
                            className="opacity-60 transition-opacity hover:opacity-100"
                        >
                            <span className="material-icons-round text-base">close</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
