/**
 * Normalisation applied to Quill's output on the way to storage.
 *
 * react-quill-new builds its value with Quill's `getSemanticHTML()`, which
 * emits `&nbsp;` for *every* space — `<p>alpha&nbsp;beta&nbsp;gamma</p>`. That
 * is not cosmetic: non-breaking spaces suppress line wrapping, so a long
 * paragraph refuses to break where it should and overflows its column on narrow
 * screens. Every article saved through this editor carried them.
 *
 * The obvious alternative, `useSemanticHTML={false}`, trades the problem for a
 * worse one: Quill's raw innerHTML renders bullet lists as
 * `<ol><li data-list="bullet">` plus `<span class="ql-ui">` artifacts, and
 * `data-list` is not in the sanitizer allowlist — so every bullet list would be
 * stripped down to a numbered one. Keeping semantic output and undoing the
 * spaces is the only combination that produces correct HTML on both counts.
 */

/**
 * Turns Quill's `&nbsp;` runs back into ordinary spaces.
 *
 * Every space in the editor arrives as `&nbsp;`, so there is no signal that
 * distinguishes an author's deliberate non-breaking space from Quill's
 * encoding. Ordinary spaces are overwhelmingly the intent, and correct wrapping
 * matters more than preserving a distinction the editor cannot express anyway.
 */
export function normalizeEditorHtml(html: string | null | undefined): string {
    if (!html) return '';
    return html.replace(/&nbsp;/g, ' ');
}

export default normalizeEditorHtml;
