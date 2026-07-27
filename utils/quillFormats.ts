import { Quill } from 'react-quill-new';

/**
 * Extra formats registered onto Quill, imported once for its side effect.
 *
 * Only formats whose output survives the article sanitizer belong here. Quill
 * can emit two kinds of markup: classes (`ql-align-center`, `ql-indent-1`) and
 * inline styles. `class` is in the allowlist and `style` deliberately is not,
 * so class-based and tag-based formats are safe to offer and colour/font/size
 * are not — they would look right in the editor and vanish on save, which is
 * exactly the bug this editor is recovering from.
 */

const BlockEmbed = Quill.import('blots/block/embed') as {
    new(): unknown;
    blotName?: string;
    tagName?: string;
};

class DividerBlot extends (BlockEmbed as new () => Record<string, unknown>) { }
(DividerBlot as unknown as { blotName: string }).blotName = 'divider';
(DividerBlot as unknown as { tagName: string }).tagName = 'hr';

let registered = false;

/** Idempotent: React strict mode and hot reload both import this twice. */
export function registerEditorFormats(): void {
    if (registered) return;
    registered = true;

    Quill.register('formats/divider', DividerBlot as never, true);

    // Quill draws a toolbar button for any format name it is given, but only
    // ships icons for its own. Without this the divider button renders blank.
    const icons = Quill.import('ui/icons') as Record<string, string>;
    icons.divider = '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="3" y1="9" x2="15" y2="9"></line></svg>';
}

registerEditorFormats();

export default registerEditorFormats;
