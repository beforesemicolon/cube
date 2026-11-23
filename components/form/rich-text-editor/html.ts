import { defaultTreeAdapter, parseFragment, type DefaultTreeAdapterTypes } from 'parse5'
import { normalizeRuns, plainText, resolveReferences, richTextTags, setFormat, type RichTextReference, type RichTextFormat, type RichTextRun } from './model.js'

const formats: Readonly<Record<string, RichTextFormat>> = {
    B: 'bold', STRONG: 'bold', I: 'italic', EM: 'italic', U: 'underline', S: 'strikethrough', STRIKE: 'strikethrough', DEL: 'strikethrough', SUP: 'superscript', SUB: 'subscript',
}
const discard = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'SVG', 'MATH', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'])
const blocks = new Set(['DIV', 'P', 'LI', 'UL', 'OL', 'SECTION', 'ARTICLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'TR'])
const isElement = (node: Node): node is Element => node.nodeType === 1

/** Read text and supported marks only. No parsed element or attribute enters the live document. */
export function readRichText(root: Node, inline = false, editing = false, references: readonly RichTextReference[] = []): readonly RichTextRun[] {
    if (editing && !root.textContent) {
        const walker = root.ownerDocument?.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
        let breaks = 0, caret = false
        for (let node = walker?.nextNode(); node; node = walker?.nextNode()) {
            if (isElement(node) && node.tagName === 'BR') { if (node.hasAttribute('data-caret')) caret = true; else breaks++ }
        }
        // Browsers leave a sole <br> (sometimes inside a mark) after deleting
        // all content. Our own trailing caret marker distinguishes a real line break.
        if (!caret && breaks <= 1) return []
    }
    const runs: RichTextRun[] = []
    const append = (text: string, marks: readonly RichTextFormat[]): void => { if (text) runs.push({ text, formats: marks }) }
    const lineBreak = (): void => { if (runs.length && !runs.at(-1)?.text.endsWith('\n')) append('\n', []) }
    const visit = (node: Node, marks: readonly RichTextFormat[]): void => {
        if (node.nodeType === Node.TEXT_NODE) { append(node.textContent ?? '', marks); return }
        if (!isElement(node) && node !== root) return
        if (isElement(node)) {
            const reference = references.find(reference => reference.value === node.getAttribute('data-cb-reference'))
            if (reference && node.textContent === (reference.text.replace(/\r\n?/g, '\n').replace(/\n/g, inline ? ' ' : '\n') || '\u200b')) { runs.push({ text: reference.text || '\u200b', formats: marks, reference: reference.value }); return }
            const tag = node.tagName.toUpperCase()
            if (node !== root && discard.has(tag)) return
            if (tag === 'BR') {
                const placeholder = editing && (node.hasAttribute('data-caret') || isElement(root) && node === root.lastChild)
                if (!placeholder) append('\n', marks)
                return
            }
            if (blocks.has(tag) && node !== root) lineBreak()
            const format = Object.hasOwn(formats, tag) ? formats[tag] : undefined
            if (format) marks = setFormat(marks, format, true)
        }
        for (const child of node.childNodes) visit(child, marks)
        if (isElement(node) && blocks.has(node.tagName.toUpperCase()) && node !== root && node.nextSibling) lineBreak()
    }
    visit(root, [])
    return normalizeRuns(runs, inline)
}
type ParsedNode = DefaultTreeAdapterTypes.ChildNode
const parsedText = (node: ParsedNode): string =>
    defaultTreeAdapter.isTextNode(node)
        ? node.value
        : defaultTreeAdapter.isElementNode(node)
          ? node.childNodes.map(parsedText).join('')
          : ''

export function parseRichText(
    html: string,
    inline = false,
    references: readonly RichTextReference[] = []
): readonly RichTextRun[] {
    // Keep the untrusted input in a plain tree: no browser elements, resource
    // requests, custom element lifecycle, or HTML sinks are involved.
    const root = parseFragment(html)
    const runs: RichTextRun[] = []
    const append = (text: string, marks: readonly RichTextFormat[]): void => {
        if (text) runs.push({ text, formats: marks })
    }
    const lineBreak = (): void => {
        if (runs.length && !runs.at(-1)?.text.endsWith('\n')) append('\n', [])
    }

    const visit = (
        node: ParsedNode,
        marks: readonly RichTextFormat[],
        followedBySibling: boolean
    ): void => {
        if (defaultTreeAdapter.isTextNode(node)) {
            append(node.value, marks)
            return
        }
        if (!defaultTreeAdapter.isElementNode(node)) return
        const tag = node.tagName.toUpperCase()
        if (discard.has(tag)) return

        if (tag === 'SPAN') {
            const token = node.attrs.find(attr => attr.name === 'data-cb-reference')?.value
            const reference = token && references.find(item => item.value === token)
            if (reference && parsedText(node) === (reference.text.replace(/\r\n?/g, '\n').replace(/\n/g, inline ? ' ' : '\n') || '\u200b')) {
                runs.push({ text: reference.text || '\u200b', formats: marks, reference: reference.value })
                return
            }
        }
        if (tag === 'BR') {
            append('\n', marks)
            return
        }
        if (blocks.has(tag)) lineBreak()
        const format = Object.hasOwn(formats, tag) ? formats[tag] : undefined
        const nextMarks = format ? setFormat(marks, format, true) : marks
        node.childNodes.forEach((child, index) =>
            visit(child, nextMarks, index < node.childNodes.length - 1)
        )
        if (blocks.has(tag) && followedBySibling) lineBreak()
    }

    root.childNodes.forEach((child, index) =>
        visit(child, [], index < root.childNodes.length - 1)
    )
    return resolveReferences(normalizeRuns(runs, inline), references, inline)
}

/** Build the editor surface from fixed tags and literal text, not from HTML. */
export function syncEditorContent(editor: HTMLElement, runs: readonly RichTextRun[]): void {
    const document = editor.ownerDocument
    const fragment = document.createDocumentFragment()
    for (const run of normalizeRuns(runs)) {
        let target: DocumentFragment | HTMLElement = fragment
        for (const format of run.formats) {
            const mark = document.createElement(richTextTags[format])
            target.append(mark)
            target = mark
        }
        if (run.reference) {
            const span = document.createElement('span')
            span.setAttribute('data-cb-reference', run.reference)
            span.contentEditable = 'false'
            span.textContent = run.text
            target.append(span)
            continue
        }
        run.text.split('\n').forEach((text, index) => {
            if (index) target.append(document.createElement('br'))
            if (text) target.append(document.createTextNode(text))
        })
    }
    if (!fragment.childNodes.length || plainText(runs).endsWith('\n')) {
        const caret = document.createElement('br')
        caret.setAttribute('data-caret', '')
        fragment.append(caret)
    }
    // Do not replace the browser selection when the surface is already current.
    if (fragment.childNodes.length === editor.childNodes.length &&
        Array.from(fragment.childNodes).every((node, index) => node.isEqualNode(editor.childNodes[index]))) return
    editor.replaceChildren(fragment)
}
