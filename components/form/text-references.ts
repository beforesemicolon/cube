import { nativeMentionAdapter, type MentionAdapter, type MentionSelection } from '../core/mentions.js'
import { plainText, referenceSelection, replaceRuns, resolveReferences, type RichTextReference, type RichTextRun } from './rich-text-editor/model.js'

/** Native plain-text fields keep their source value separate from the displayed reference labels. */
export class TextReferenceController {
    private source = ''
    private runs: readonly RichTextRun[] = []
    private before: MentionSelection | null = null
    private undo: string[] = []
    private redo: string[] = []
    private readonly abort: AbortController
    readonly adapter: MentionAdapter
    constructor(private readonly element: HTMLInputElement | HTMLTextAreaElement,
        private readonly value: () => string, private readonly references: () => readonly RichTextReference[],
        private readonly commit: (value: string, event: Event) => boolean) {
        const Abort = element.ownerDocument.defaultView!.AbortController
        this.abort = new Abort()
        const native = nativeMentionAdapter(element, commit)
        this.adapter = { ...native, replace: (range, text, event) => this.replace(range, text, event) }
        element.addEventListener('beforeinput', () => { this.before = native.selection() }, { signal: this.abort.signal })
        element.addEventListener('keydown', event => {
            if (!(event instanceof KeyboardEvent) || !this.references().length || event.isComposing || !(event.metaKey || event.ctrlKey) || event.altKey || event.key.toLowerCase() !== 'z') return
            if (element.disabled || element.readOnly) return
            event.preventDefault(); event.stopImmediatePropagation()
            const from = event.shiftKey ? this.redo : this.undo, to = event.shiftKey ? this.undo : this.redo
            const previous = from.pop()
            if (previous === undefined) return
            const current = this.value()
            this.source = previous
            if (this.commit(previous, event)) { to.push(current); this.sync(); element.setSelectionRange(element.value.length, element.value.length) }
            else { this.source = current; from.push(previous); this.sync() }
        }, { capture: true, signal: this.abort.signal })
        this.sync()
    }
    sync = (): void => {
        const source = this.value()
        if (source !== this.source) { this.undo = []; this.redo = [] }
        this.source = source
        this.runs = resolveReferences([{ text: source, formats: [] }], this.references(), this.element instanceof HTMLInputElement)
        const display = plainText(this.runs)
        if (this.element.value !== display) this.element.value = display
    }
    /** Called for native input events; application setters continue to accept source strings. */
    input = (display: string, event: Event): boolean => {
        if (!this.references().length) return this.commit(display, event)
        const previous = plainText(this.runs)
        let start = 0, end = previous.length, inserted = display
        // beforeinput identifies which occurrence changed even when surrounding characters repeat.
        if (this.before && event instanceof InputEvent && !['historyUndo', 'historyRedo'].includes(event.inputType)) {
            start = this.before.start; end = this.before.end
            if (start === end && display.length < previous.length) {
                if (event.inputType.includes('Backward')) start -= previous.length - display.length
                else end += previous.length - display.length
            }
            inserted = display.slice(start, display.length - (previous.length - end))
            if (previous.slice(0, start) + inserted + previous.slice(end) !== display) start = -1
        } else start = -1
        if (start < 0) {
            start = 0
            while (start < previous.length && start < display.length && previous[start] === display[start]) start++
            end = previous.length
            let after = display.length
            while (end > start && after > start && previous[end - 1] === display[after - 1]) { end--; after-- }
            inserted = display.slice(start, after)
        }
        this.before = null
        return this.replace({ start: Math.max(0, start), end }, inserted, event)
    }
    private replace = (selection: MentionSelection, text: string, event: Event): boolean => {
        if (this.element.disabled || this.element.readOnly) return false
        const previous = this.value(), range = referenceSelection(this.runs, selection)
        const replacement = resolveReferences([{ text, formats: [] }], this.references(), this.element instanceof HTMLInputElement)
        const runs = replaceRuns(this.runs, range, replacement)
        const source = runs.map(run => run.reference || run.text).join('')
        this.source = source
        if (!this.commit(source, event)) { this.source = previous; this.sync(); return false }
        this.undo.push(previous); if (this.undo.length > 200) this.undo.shift()
        this.redo = []; this.sync()
        const caret = range.start + plainText(replacement).length
        this.element.focus({ preventScroll: true }); this.element.setSelectionRange(caret, caret)
        return true
    }
    dispose = (): void => this.abort.abort()
}
