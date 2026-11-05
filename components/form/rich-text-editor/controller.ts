import { MentionController, type MentionConfiguration } from '../../core/mentions.js'
import { state } from '../../core/runtime.js'
import { activeFormats, normalizeRuns, plainText, referenceSelection, replaceRuns, resolveReferences, serializeRuns, setFormat, sliceRuns, toggleRuns,
    type RichTextFormat, type RichTextReference, type RichTextRun, type RichTextSelection } from './model.js'
import { parseRichText, readRichText, syncEditorContent } from './html.js'
import { editorSelection, restoreEditorSelection } from './selection.js'

interface Snapshot { readonly value: string; readonly selection: RichTextSelection }
interface CompositionEdit { readonly selection: RichTextSelection; readonly length: number; readonly formats: readonly RichTextFormat[] }
const inputFormats: Readonly<Partial<Record<string, RichTextFormat>>> = {
    formatBold: 'bold', formatItalic: 'italic', formatUnderline: 'underline', formatStrikeThrough: 'strikethrough', formatSuperscript: 'superscript', formatSubscript: 'subscript',
}


export interface RichTextControllerOptions {
    references?: () => readonly RichTextReference[]
    mentions?: () => MentionConfiguration | null | undefined
    value: () => string
    commit: (value: string, originalEvent: Event) => boolean
    blocked?: () => boolean
    formatsChanged?: (formats: readonly RichTextFormat[]) => void
    submit?: (event: KeyboardEvent) => void
    inline?: boolean | (() => boolean)
    plainText?: boolean
    inlineRun?: boolean
}

/** Native editable-surface interop shared by fields and document authoring. No layout or UI. */
export class RichTextController {
    private readonly selected = state<RichTextSelection>({ start: 0, end: 0 })
    private readonly active = state<readonly RichTextFormat[]>([])
    private pendingFormats?: readonly RichTextFormat[]
    private mentions?: MentionController
    private applying = false
    private composing = false
    private compositionEdit?: CompositionEdit
    private beforeEdit?: Snapshot
    private renderedValue?: string
    private history: Snapshot[] = []
    private historyIndex = -1

    private readonly listeners: AbortController
    private readonly restoreContent: () => void
    private readonly originalAttributes: Map<string, string | null>
    private readonly wrapper?: HTMLElement
    private readonly editor: HTMLElement
    private readonly originalWhiteSpace: { value: string; priority: string; hadStyle: boolean }
    private readonly ownerDocument: Document
    constructor(target: HTMLElement | Text, private readonly options: RichTextControllerOptions) {
        this.ownerDocument = target.ownerDocument
        // Text within mixed inline content needs its own editing boundary so
        // editing one authored text run never replaces its neighboring nodes.
        const inlineTags = new Set(['STRONG', 'EM', 'U', 'S', 'SUP', 'SUB', 'BR'])
        const inlineContent = (node: Node): boolean => node.nodeType === 3 || node.nodeType === 1 &&
            inlineTags.has((node as Element).tagName) && Array.from(node.childNodes).every(inlineContent)
        let parent = target.parentElement
        if (options.inlineRun) {
            while (parent && inlineTags.has(parent.tagName) && parent.parentElement && Array.from(parent.parentElement.childNodes).every(inlineContent)) parent = parent.parentElement
        }
        if (target.nodeType === 3 && (!options.inlineRun || !parent || !Array.from(parent.childNodes).every(inlineContent)) && target.parentElement?.childNodes.length !== 1) {
            const wrapper = this.ownerDocument.createElement('span')
            target.replaceWith(wrapper); wrapper.append(target)
            this.wrapper = wrapper
            this.editor = wrapper
        } else this.editor = target.nodeType === 3 ? parent! : target as HTMLElement
        // Keep the actual nodes: framework bindings may still reference them.
        // Editing uses a temporary DOM, then restores those same nodes and values.
        const capture = (node: Node): (() => void) => {
            const children = Array.from(node.childNodes), value = node.nodeValue
            const restore = children.map(capture)
            return () => {
                if (node.nodeValue !== value) node.nodeValue = value
                restore.forEach(reset => reset())
                children.forEach((child, index) => {
                    if (node.childNodes[index] !== child) node.insertBefore(child, node.childNodes[index] || null)
                })
                const keep = new Set(children)
                Array.from(node.childNodes).forEach(child => { if (!keep.has(child)) node.removeChild(child) })
            }
        }
        this.restoreContent = capture(this.editor)
        this.originalWhiteSpace = { value: this.editor.style.getPropertyValue('white-space'), priority: this.editor.style.getPropertyPriority('white-space'), hadStyle: this.editor.hasAttribute('style') }
        // Keep spaces visible and selectable instead of collapsing trailing
        // spaces out of the caret/selection range between transactions.
        this.editor.style.setProperty('white-space', 'break-spaces', 'important')
        this.originalAttributes = new Map(['contenteditable', 'spellcheck', 'tabindex'].map(name => [name, this.editor.getAttribute(name)]))
        const ViewAbort = this.ownerDocument.defaultView?.AbortController ?? AbortController
        this.listeners = new ViewAbort()
        this.editor.setAttribute('contenteditable', 'true')
        this.editor.setAttribute('spellcheck', 'true')
        this.editor.setAttribute('tabindex', '0')
        const signal = this.listeners.signal
        this.editor.addEventListener('beforeinput', this.beforeInput, { signal })
        this.editor.addEventListener('input', this.input, { signal })
        this.editor.addEventListener('keydown', this.keydown, { signal })
        this.editor.addEventListener('paste', this.paste, { signal })
        this.editor.addEventListener('drop', this.drop, { signal })
        this.editor.addEventListener('dragover', this.allowDrop, { signal })
        this.editor.addEventListener('focus', this.rememberSelection, { signal })
        this.editor.addEventListener('mouseup', this.rememberSelection, { signal })
        this.editor.addEventListener('keyup', this.rememberSelection, { signal })
        this.editor.addEventListener('compositionstart', this.compositionStart, { signal })
        this.editor.addEventListener('compositionend', this.compositionEnd, { signal })
        this.ownerDocument.addEventListener('selectionchange', this.rememberSelection, { signal })
        this.syncView()
        this.mentions = new MentionController({ element: this.editor, text: () => plainText(this.runs()),
            selection: () => editorSelection(this.editor, this.inlineMode()) ?? null, blocked: () => !this.canChangeValue(),
            replace: (range, text, event) => {
                const before = this.snapshot(), replacement = resolveReferences([{ text, formats: activeFormats(this.runs(), range) }], this.references(), this.inlineMode())
                const caret = range.start + plainText(replacement).length
                return this.commitEdit(replaceRuns(this.runs(), range, replacement), { start: caret, end: caret }, event, before)
            },
            caretRect: () => { const selection = this.ownerDocument.getSelection(); return selection?.rangeCount ? selection.getRangeAt(0).getBoundingClientRect() : this.editor.getBoundingClientRect() },
        }, () => this.options.mentions?.())
    }
    private get value(): string { return this.options.value() }
    private inlineMode = (): boolean => typeof this.options.inline === 'function' ? this.options.inline() : this.options.inline ?? false
    private canChangeValue = (): boolean => !this.options.blocked?.()
    private setValue = (value: string, event?: Event): boolean => {
        const accepted = this.canChangeValue() && this.options.commit(value, event ?? new Event('input'))
        if (accepted) this.syncView()
        return accepted
    }
    focus = (options?: FocusOptions, point?: { x: number; y: number }): void => {
        this.editor.focus(options)
        if (point && typeof this.ownerDocument.caretPositionFromPoint === 'function') {
            const root = this.editor.getRootNode()
            const caret = this.ownerDocument.caretPositionFromPoint(point.x, point.y,
                root.nodeType === 11 && 'host' in root ? { shadowRoots: [root as ShadowRoot] } : {})
            if (caret && this.editor.contains(caret.offsetNode)) {
                const range = this.ownerDocument.createRange()
                range.setStart(caret.offsetNode, caret.offset); range.collapse(true)
                const selection = this.ownerDocument.getSelection()
                selection?.removeAllRanges(); selection?.addRange(range)
                this.rememberSelection()
                return
            }
        }
        if (!editorSelection(this.editor, this.inlineMode())) restoreEditorSelection(this.editor, this.selected[0]())
    }
    sync = (): void => this.syncView()
    private syncView = (): void => {
        const value = this.value
        if (!this.composing) syncEditorContent(this.editor, this.runs())
        if (!this.applying && this.renderedValue !== value) {
            this.selected[1]({ start: 0, end: 0 }); this.pendingFormats = undefined
            this.history = [{ value, selection: this.selected[0]() }]; this.historyIndex = 0
        }
        this.renderedValue = value
        this.updateActive()
    }
    dispose = (restore = true): void => {
        this.mentions?.dispose()
        this.listeners.abort()
        if (restore) this.restoreContent()
        for (const [name, value] of this.originalAttributes) {
            if (value === null) this.editor.removeAttribute(name)
            else this.editor.setAttribute(name, value)
        }
        if (this.originalWhiteSpace.value) this.editor.style.setProperty('white-space', this.originalWhiteSpace.value, this.originalWhiteSpace.priority)
        else this.editor.style.removeProperty('white-space')
        if (!this.originalWhiteSpace.hadStyle && !this.editor.style.length) this.editor.removeAttribute('style')
        if (this.wrapper) this.wrapper.replaceWith(...this.wrapper.childNodes)
    }
    private snapshot = (): Snapshot => ({ value: this.value, selection: this.selected[0]() })
    private references = (): readonly RichTextReference[] => this.options.references?.() || []
    private runs = (): readonly RichTextRun[] => parseRichText(this.value, this.ownerDocument, this.inlineMode(), this.references())
    private updateActive = (): void => {
        const next = this.pendingFormats ?? activeFormats(this.runs(), this.selected[0]())
        if (next.join() !== this.active[0]().join()) { this.active[1](next); this.options.formatsChanged?.(next) }
    }
    private rememberSelection = (): void => {
        const selection = this.editor && editorSelection(this.editor, this.inlineMode())
        if (!selection) return
        const previous = this.selected[0]()
        if (selection.start !== previous.start || selection.end !== previous.end) this.pendingFormats = undefined
        this.selected[1](selection); this.updateActive()
    }
    private restoreSelection = (selection: RichTextSelection, focus = true): void => {
        const editor = this.editor
        if (!editor) return
        this.selected[1](selection)
        if (focus) editor.focus({ preventScroll: true })
        restoreEditorSelection(editor, selection)
        this.updateActive()
    }
    private commitEdit = (runs: readonly RichTextRun[], selection: RichTextSelection, event: Event, before = this.snapshot()): boolean => {
        const normalized = normalizeRuns(this.options.plainText ? runs.map(run => ({ ...run, formats: [] })) : runs, this.inlineMode())
        const next = serializeRuns(normalized)
        this.applying = true
        let accepted = false
        try { accepted = this.setValue(next, event) }
        finally { this.applying = false }
        if (accepted) {
            this.history[this.historyIndex] = before
            this.history.splice(this.historyIndex + 1)
            this.history.push({ value: this.value, selection }); this.historyIndex++
            if (this.history.length > 100) { this.history.shift(); this.historyIndex-- }
        } else this.syncView()
        if (!this.composing) this.restoreSelection(accepted || next === this.value ? selection : before.selection)
        else this.selected[1](selection)
        this.updateActive()
        return accepted
    }
    private insert = (replacement: readonly RichTextRun[], event: Event): void => {
        this.rememberSelection()
        const selection = referenceSelection(this.runs(), this.selected[0]()), normalized = normalizeRuns(replacement, this.inlineMode())
        const caret = selection.start + plainText(normalized).length
        this.commitEdit(replaceRuns(this.runs(), selection, normalized), { start: caret, end: caret }, event)
    }
    format = (format: RichTextFormat, event?: Event): void => {
        if (!this.canChangeValue() || this.options.plainText) { this.updateActive(); return }
        this.rememberSelection()
        const selection = this.selected[0]()
        if (selection.start === selection.end) {
            this.pendingFormats = setFormat(this.active[0](), format, !this.active[0]().includes(format))
            this.restoreSelection(selection)
        } else this.commitEdit(toggleRuns(this.runs(), selection, format), selection, event ?? new Event('format'))
        this.updateActive()
    }
    private beforeInput = (event: InputEvent): void => {
        this.rememberSelection(); this.beforeEdit = this.snapshot()
        if (!this.canChangeValue()) { event.preventDefault(); return }
        if (!event.cancelable || event.isComposing || this.composing) return
        if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') {
            event.preventDefault(); this.travelHistory(event.inputType === 'historyUndo' ? -1 : 1, event)
        } else if (event.inputType === 'insertText' && event.data !== null) {
            event.preventDefault(); this.insert([{ text: event.data, formats: this.active[0]() }], event)
        } else if (event.inputType === 'insertParagraph' || event.inputType === 'insertLineBreak') {
            event.preventDefault(); if (!this.inlineMode()) this.insert([{ text: '\n', formats: this.active[0]() }], event)
        } else {
            const format = inputFormats[event.inputType]
            if (format) { event.preventDefault(); this.format(format, event) }
        }
        if (event.defaultPrevented) this.beforeEdit = undefined
    }
    private input = (event: InputEvent): void => {
        const editor = this.editor
        if (!editor) return
        const selection = editorSelection(editor, this.inlineMode()) ?? this.selected[0]()
        let runs = readRichText(editor, this.inlineMode(), true, this.references())
        const composition = this.compositionEdit
        if (this.composing && composition) {
            const end = Math.max(composition.selection.start, plainText(runs).length - (composition.length - composition.selection.end))
            const inserted = sliceRuns(runs, composition.selection.start, end).map(run => ({ text: run.text, formats: composition.formats }))
            runs = replaceRuns(runs, { start: composition.selection.start, end }, inserted)
        }
        this.commitEdit(runs, selection, event, this.beforeEdit ?? this.snapshot())
        this.beforeEdit = undefined
    }
    private keydown = (event: KeyboardEvent): void => {
        if (event.isComposing || !this.canChangeValue()) return
        // Native buttons reserve Space for activation even while contenteditable.
        // Insert through the same transaction as beforeinput and cancel that
        // default action so the edit neither loses the space nor clicks the button.
        if (this.editor.tagName === 'BUTTON' && event.key === ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault()
            this.rememberSelection()
            this.insert([{ text: ' ', formats: this.active[0]() }], event)
            return
        }
        if (event.ctrlKey || event.metaKey) {
            const key = event.key.toLowerCase()
            const format = key === 'b' ? 'bold' : key === 'i' ? 'italic' : key === 'u' ? 'underline' : undefined
            if (format) { event.preventDefault(); this.format(format, event) }
            else if (key === 'z' || key === 'y') { event.preventDefault(); this.travelHistory(key === 'y' || event.shiftKey ? 1 : -1, event) }
        }
        if (event.key === 'Enter') {
            event.preventDefault()
            if (this.inlineMode()) this.options.submit?.(event)
            else this.insert([{ text: '\n', formats: this.active[0]() }], event)
        }
    }
    private travelHistory = (direction: number, event: Event): void => {
        if (!this.canChangeValue()) return
        const index = this.historyIndex + direction, snapshot = this.history[index]
        if (!snapshot) return
        this.applying = true
        try { if (this.setValue(snapshot.value, event)) { this.historyIndex = index; this.pendingFormats = undefined; this.restoreSelection(snapshot.selection) } }
        finally { this.applying = false }
    }
    private paste = (event: ClipboardEvent): void => {
        event.preventDefault()
        if (!this.canChangeValue() || !event.clipboardData) return
        const html = event.clipboardData.getData('text/html')
        const runs = html ? parseRichText(html, this.ownerDocument, this.inlineMode(), this.references()) : [{ text: event.clipboardData.getData('text/plain'), formats: this.active[0]() }]
        if (plainText(runs)) this.insert(runs, event)
    }
    private allowDrop = (event: DragEvent): void => { event.preventDefault() }
    private drop = (event: DragEvent): void => {
        event.preventDefault()
        if (!this.canChangeValue() || !event.dataTransfer) return
        const html = event.dataTransfer.getData('text/html')
        const runs = html ? parseRichText(html, this.ownerDocument, this.inlineMode(), this.references()) : [{ text: event.dataTransfer.getData('text/plain'), formats: [] }]
        if (plainText(runs)) this.insert(runs, event)
    }
    private compositionStart = (): void => {
        this.rememberSelection(); this.beforeEdit = this.snapshot()
        this.compositionEdit = { selection: this.selected[0](), length: plainText(this.runs()).length, formats: this.active[0]() }
        this.composing = true
    }
    private compositionEnd = (): void => {
        this.composing = false
        this.compositionEdit = undefined
        const selection = this.editor && editorSelection(this.editor, this.inlineMode())
        this.syncView()
        if (selection) this.restoreSelection(selection)
    }
}
