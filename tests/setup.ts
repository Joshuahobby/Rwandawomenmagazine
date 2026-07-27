import '@testing-library/jest-dom';

/**
 * jsdom implements Range but not its layout methods, and Quill reaches for them
 * whenever it focuses the editor (`getSelection(true)` → `focus()` →
 * `scrollSelectionIntoView()` → `getBounds()`). Without these shims any test
 * that drives a real Quill instance dies on `getBoundingClientRect is not a
 * function` — a jsdom gap, not a defect in the code under test.
 *
 * Zeroed rects are the honest answer here: nothing is laid out in jsdom, so any
 * other value would be fiction. Nothing asserts on geometry.
 */
const emptyRect = (): DOMRect => ({
    x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0,
    toJSON() { return this; },
} as DOMRect);

if (typeof Range !== 'undefined') {
    if (!Range.prototype.getBoundingClientRect) {
        Range.prototype.getBoundingClientRect = emptyRect;
    }
    if (!Range.prototype.getClientRects) {
        Range.prototype.getClientRects = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
    }
}

if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => { };
}
