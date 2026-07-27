import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useAutosave, readDraft, clearDraft, draftKey } from '../components/editor/useAutosave';
import { countWords } from '../components/editor/EditorStatusBar';

interface Draft { title: string; content: string }

let state: ReturnType<typeof useAutosave<Draft>>;

function Harness({ data, articleId }: { data: Draft; articleId?: string }) {
    state = useAutosave<Draft>(articleId, data, { enabled: true, intervalMs: 1000 });
    return <span>{state.isDirty ? 'dirty' : 'clean'}</span>;
}

beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('useAutosave', () => {
    it('writes nothing while the document is unchanged', () => {
        render(<Harness data={{ title: 'A', content: '<p>x</p>' }} articleId="a1" />);
        act(() => { vi.advanceTimersByTime(3000); });

        expect(localStorage.getItem(draftKey('a1'))).toBeNull();
        expect(state.isDirty).toBe(false);
    });

    it('snapshots the draft once it diverges from the baseline', () => {
        const { rerender } = render(<Harness data={{ title: 'A', content: '<p>x</p>' }} articleId="a1" />);
        rerender(<Harness data={{ title: 'A', content: '<p>much longer draft</p>' }} articleId="a1" />);
        act(() => { vi.advanceTimersByTime(1100); });

        const stored = readDraft<Draft>('a1');
        expect(stored?.data.content).toBe('<p>much longer draft</p>');
        expect(state.isDirty).toBe(true);
    });

    it('drops the snapshot once the server has the content', () => {
        const { rerender } = render(<Harness data={{ title: 'A', content: '<p>x</p>' }} articleId="a1" />);
        rerender(<Harness data={{ title: 'A', content: '<p>edited</p>' }} articleId="a1" />);
        act(() => { vi.advanceTimersByTime(1100); });
        expect(readDraft<Draft>('a1')).not.toBeNull();

        act(() => { state.markClean(); });

        expect(readDraft<Draft>('a1')).toBeNull();
        expect(state.isDirty).toBe(false);
    });

    it('keeps a new article\'s draft separate from a saved one\'s', () => {
        render(<Harness data={{ title: 'A', content: '<p>x</p>' }} />);
        expect(draftKey(undefined)).not.toBe(draftKey('a1'));
    });

    it('survives localStorage being unavailable', () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });
        const { rerender } = render(<Harness data={{ title: 'A', content: '<p>x</p>' }} articleId="a1" />);
        rerender(<Harness data={{ title: 'A', content: '<p>edited</p>' }} articleId="a1" />);

        // Typing must not break because storage is full or blocked.
        expect(() => act(() => { vi.advanceTimersByTime(1100); })).not.toThrow();
        setItem.mockRestore();
    });

    it('ignores a stale draft rather than resurrecting old work', () => {
        localStorage.setItem(
            draftKey('a1'),
            JSON.stringify({ savedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, data: { title: 'old', content: '' } }),
        );
        expect(readDraft('a1')).toBeNull();
    });

    it('ignores corrupt stored JSON', () => {
        localStorage.setItem(draftKey('a1'), 'not json');
        expect(readDraft('a1')).toBeNull();
    });

    it('clearDraft removes only the targeted article', () => {
        localStorage.setItem(draftKey('a1'), JSON.stringify({ savedAt: Date.now(), data: {} }));
        localStorage.setItem(draftKey('b2'), JSON.stringify({ savedAt: Date.now(), data: {} }));

        clearDraft('a1');

        expect(localStorage.getItem(draftKey('a1'))).toBeNull();
        expect(localStorage.getItem(draftKey('b2'))).not.toBeNull();
    });
});

describe('countWords', () => {
    it.each([
        ['<p>one two three</p>', 3],
        ['<p>alpha&nbsp;beta</p>', 2],
        ['<h2>Title</h2><p>body here</p>', 3],
        ['<p><img src="x.png"></p>', 0],
        ['', 0],
        [null, 0],
    ])('%s -> %s words', (html, expected) => {
        expect(countWords(html)).toBe(expected);
    });
});
