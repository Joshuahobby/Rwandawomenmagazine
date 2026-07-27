import { useCallback, useEffect, useState } from 'react';
import { Quill } from 'react-quill-new';
import type QuillType from 'quill';
import { uploadEditorImage, uploadErrorMessage } from '../../utils/quillImageUpload';

export type ImageAlign = 'left' | 'center' | 'right';

export interface SelectedImage {
    /** Position of the embed in the document. */
    index: number;
    src: string;
    align: ImageAlign;
    /** Quill's `width` attribute — a percentage string, or '' for natural size. */
    width: string;
    alt: string;
}

/**
 * Everything the editor does with images, in one place.
 *
 * Two decisions worth stating, because they are what make images behave like a
 * magazine rather than a chat box:
 *
 *  - Images are inserted as their own block. Quill's native behaviour drops the
 *    embed inline wherever the caret happens to be, so it lands mid-sentence and
 *    reads as a broken glyph rather than a picture.
 *  - Align, width and alt use Quill's own formats. They emit `ql-align-*`
 *    classes and `width`/`alt` attributes, all of which are already in the
 *    sanitizer allowlist — so styling an image cannot make it disappear on save,
 *    which is precisely the failure mode this editor is recovering from.
 */
export interface EditorImagesApi {
    selected: SelectedImage | null;
    uploading: number;
    uploadAndInsert: (files: File[], atIndex?: number) => Promise<void>;
    insertUrl: (url: string) => void;
    setAlign: (align: ImageAlign) => void;
    setWidth: (width: string) => void;
    setAlt: (alt: string) => void;
    remove: () => void;
    clearSelection: () => void;
}

/** Places an embed on a line of its own and returns the index it landed on. */
function insertBlockImage(quill: QuillType, index: number, url: string): number {
    const [line, offset] = quill.getLine(index);
    const lineIsEmpty = (line?.length() ?? 1) <= 1;

    let at = index;
    // Splitting is only needed when the caret sits inside existing text.
    if (!lineIsEmpty && offset !== 0) {
        quill.insertText(at, '\n', 'user');
        at += 1;
    }

    quill.insertEmbed(at, 'image', url, 'user');
    // Guarantee a paragraph after the image so the author can keep typing
    // instead of being trapped at the end of the document.
    quill.insertText(at + 1, '\n', 'user');

    // Centred is the magazine default, and it gives the author something to
    // change rather than a bare left-hugging image. Aligning *after* the split
    // and explicitly clearing the following line matters: formatting before it
    // makes the new paragraph inherit the centring, so the author's next
    // sentence silently comes out centred.
    quill.formatLine(at, 1, 'align', 'center', 'user');
    quill.formatLine(at + 2, 1, 'align', false, 'user');

    quill.setSelection(at + 2, 0, 'silent');
    return at;
}

function readImageAt(quill: QuillType, node: HTMLImageElement): SelectedImage | null {
    const blot = Quill.find(node);
    if (!blot) return null;
    const index = quill.getIndex(blot as Parameters<QuillType['getIndex']>[0]);
    const format = quill.getFormat(index, 1) as { align?: ImageAlign };
    return {
        index,
        src: node.getAttribute('src') || '',
        align: format.align || 'left',
        width: node.getAttribute('width') || '',
        alt: node.getAttribute('alt') || '',
    };
}

export function useEditorImages(
    getQuill: () => QuillType | null,
    onError: (message: string) => void,
): EditorImagesApi {
    const [selected, setSelected] = useState<SelectedImage | null>(null);
    const [uploading, setUploading] = useState(0);

    // Selection is driven by DOM clicks rather than Quill ranges: clicking an
    // embed does not always produce a length-1 range, but the click target is
    // always the <img> itself.
    useEffect(() => {
        const quill = getQuill();
        if (!quill) return;

        const onClick = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target?.tagName === 'IMG') {
                setSelected(readImageAt(quill, target as HTMLImageElement));
            } else {
                setSelected(null);
            }
        };
        const onSelectionChange = () => {
            const range = quill.getSelection();
            // A collapsed caret elsewhere means the image is no longer the subject.
            if (!range || range.length === 0) setSelected(null);
        };

        quill.root.addEventListener('click', onClick);
        quill.on('selection-change', onSelectionChange);
        return () => {
            quill.root.removeEventListener('click', onClick);
            quill.off('selection-change', onSelectionChange);
        };
    }, [getQuill]);

    const insertUrl = useCallback((url: string) => {
        const quill = getQuill();
        if (!quill) return;
        const index = quill.getSelection(true)?.index ?? quill.getLength();
        insertBlockImage(quill, index, url);
    }, [getQuill]);

    const uploadAndInsert = useCallback(async (files: File[], atIndex?: number) => {
        const quill = getQuill();
        if (!quill || files.length === 0) return;

        // getSelection(true) focuses the editor, which matters after a file
        // dialog or a drop has taken focus away from it.
        let index = atIndex ?? quill.getSelection(true)?.index ?? quill.getLength();

        setUploading(n => n + files.length);
        let pending = files.length;
        try {
            for (const file of files) {
                const url = await uploadEditorImage(file);
                const at = insertBlockImage(quill, index, url);
                index = at + 2;
                pending -= 1;
                setUploading(n => Math.max(0, n - 1));
            }
        } catch (error) {
            console.error('Inline image upload failed:', error);
            setUploading(n => Math.max(0, n - pending));
            onError(uploadErrorMessage(error));
        }
    }, [getQuill, onError]);

    // The new value is known at the call site, so mirror it into state rather
    // than re-reading the DOM — no lookup to get wrong, and the controls stay
    // responsive while Quill's own change events settle.
    const setAlign = useCallback((align: ImageAlign) => {
        const quill = getQuill();
        if (!quill || !selected) return;
        // 'left' is the default; Quill drops the class entirely for it.
        quill.formatLine(selected.index, 1, 'align', align === 'left' ? false : align, 'user');
        setSelected({ ...selected, align });
    }, [getQuill, selected]);

    const setWidth = useCallback((width: string) => {
        const quill = getQuill();
        if (!quill || !selected) return;
        quill.formatText(selected.index, 1, 'width', width || false, 'user');
        setSelected({ ...selected, width });
    }, [getQuill, selected]);

    const setAlt = useCallback((alt: string) => {
        const quill = getQuill();
        if (!quill || !selected) return;
        quill.formatText(selected.index, 1, 'alt', alt || false, 'user');
        setSelected({ ...selected, alt });
    }, [getQuill, selected]);

    const remove = useCallback(() => {
        const quill = getQuill();
        if (!quill || !selected) return;
        quill.deleteText(selected.index, 1, 'user');
        setSelected(null);
    }, [getQuill, selected]);

    const clearSelection = useCallback(() => setSelected(null), []);

    return { selected, uploading, uploadAndInsert, insertUrl, setAlign, setWidth, setAlt, remove, clearSelection };
}
