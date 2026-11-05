import { normalizeRuns, plainText, resolveReferences, serializeRuns, setFormat, type RichTextReference, type RichTextFormat, type RichTextRun } from './model.js'

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
            const format = formats[tag]
            if (format) marks = setFormat(marks, format, true)
        }
        for (const child of node.childNodes) visit(child, marks)
        if (isElement(node) && blocks.has(node.tagName.toUpperCase()) && node !== root && node.nextSibling) lineBreak()
    }
    visit(root, [])
    return normalizeRuns(runs, inline)
}
export function parseRichText(html: string, document: Document, inline = false, references: readonly RichTextReference[] = []): readonly RichTextRun[] {
    // Template contents are inert (unlike adopting untrusted DOM or loading resources into the editor).
    const template = document.createElement('template')
    template.innerHTML = html
    return resolveReferences(readRichText(template.content, inline, false, references), references, inline)
}

/** Native contenteditable interop: only canonical escaped runs enter the editing surface. */
export function syncEditorContent(editor: HTMLElement, runs: readonly RichTextRun[]): void {
    const value = serializeRuns(runs, true)
    const content = value + (!value || plainText(runs).endsWith('\n') ? '<br data-caret="">' : '')
    if (editor.innerHTML !== content) editor.innerHTML = content
}
