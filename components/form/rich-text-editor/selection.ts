import { plainText, type RichTextSelection } from './model.js'
import { readRichText } from './html.js'

export function editorSelection(editor: HTMLElement, inline: boolean): RichTextSelection | undefined {
    const selection = editor.ownerDocument.getSelection(), root = editor.getRootNode()
    if (!selection || !selection.rangeCount) return
    const range = typeof selection.getComposedRanges === 'function' && root.nodeType === 11 && 'host' in root
        ? selection.getComposedRanges({ shadowRoots: [root as ShadowRoot] })[0] : selection.getRangeAt(0)
    if (!range || !editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return
    const offset = (node: Node, position: number): number => {
        const prefix = editor.ownerDocument.createRange()
        prefix.selectNodeContents(editor); prefix.setEnd(node, position)
        return plainText(readRichText(prefix.cloneContents(), inline, true)).length
    }
    return { start: offset(range.startContainer, range.startOffset), end: offset(range.endContainer, range.endOffset) }
}
export function restoreEditorSelection(editor: HTMLElement, selection: RichTextSelection): void {
    const point = (position: number): { node: Node; offset: number } => {
        const walker = editor.ownerDocument.createTreeWalker(editor, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
            acceptNode: node => node.parentElement?.closest('[data-cb-reference]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
        })
        let remaining = position
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (node.nodeType === 1 && (node as Element).hasAttribute('data-cb-reference') && node.parentNode) {
                const length = node.textContent?.length || 0, parent = node.parentNode
                const index = Array.from(parent.childNodes).indexOf(node as ChildNode)
                if (remaining <= length) return { node: parent, offset: index + (remaining > 0 && remaining >= length / 2 ? 1 : 0) }
                remaining -= length
            } else if (node.nodeType === Node.TEXT_NODE) {
                const length = node.textContent?.length ?? 0
                if (remaining <= length) return { node, offset: remaining }
                remaining -= length
            } else if (node.nodeType === 1 && (node as Element).tagName === 'BR') {
                const parent = node.parentNode
                if (!parent) continue
                const index = Array.from(parent.childNodes).indexOf(node as Element)
                if (!remaining || (node as Element).hasAttribute('data-caret')) return { node: parent, offset: index }
                remaining--
                if (!remaining) return { node: parent, offset: index + 1 }
            }
        }
        return { node: editor, offset: editor.childNodes.length }
    }
    const start = point(selection.start), end = point(selection.end), range = editor.ownerDocument.createRange()
    range.setStart(start.node, start.offset); range.setEnd(end.node, end.offset)
    const nativeSelection = editor.ownerDocument.getSelection()
    nativeSelection?.removeAllRanges(); nativeSelection?.addRange(range)
}
