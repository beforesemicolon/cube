import { FormControlBase, type FormControlProps } from '../FormControlBase.js'
import { bool, finite, scalarText } from '../../core/value.js'
import { SourceValueController } from '../source-value.js'

export type CodeEditorValue = string | number | boolean | null | readonly CodeEditorValue[] | { readonly [key: string]: CodeEditorValue }

export interface CodeEditorProps extends FormControlProps {
    value?: CodeEditorValue
    language?: string
    placeholder?: string
    lineNumbers?: boolean
    wrap?: boolean
    tabSize?: number
    minLines?: number
    maxLines?: number
    positionLabel?: string
    submitLabel?: string
}

/** Form-associated source editing behavior, including indentation and cursor status. */
export abstract class CodeEditorBase<P extends CodeEditorProps = CodeEditorProps> extends FormControlBase<P> {
    static observedAttributes = [
        ...FormControlBase.observedAttributes, 'value', 'language', 'placeholder', 'line-numbers', 'wrap', 'tab-size',
        'min-lines', 'max-lines', 'position-label', 'submit-label',
    ]
    declare value: CodeEditorValue
    private readonly sourceValue: SourceValueController<CodeEditorValue>
    language = 'plaintext'
    placeholder = ''
    lineNumbers = true
    wrap = false
    tabSize = 2
    minLines = 8
    maxLines = 32
    positionLabel = ''
    submitLabel = ''

    constructor() {
        super()
        this.sourceValue = new SourceValueController<CodeEditorValue>(
            this,
            '',
            value => value ?? '',
            value => typeof value === 'string' || value === null || typeof value === 'number' || typeof value === 'boolean'
                ? scalarText(value)
                : null,
            () => this.syncView(),
        )
    }

    protected abstract editorElement(): HTMLTextAreaElement | undefined
    protected fieldElement(): HTMLTextAreaElement | undefined { return this.editorElement() }
    protected sourceText(): string {
        if (typeof this.value === 'string') return this.value
        if (this.value === null || typeof this.value === 'number' || typeof this.value === 'boolean') return scalarText(this.value)
        try { return JSON.stringify(this.value, null, 2) } catch { return '' }
    }
    protected captureValue(): string { return this.sourceText() }
    protected restoreValue(value: unknown): void {
        this.sourceValue.set(value instanceof FormData ? scalarText(value.get(this.name)) : scalarText(value), false)
    }
    protected normalizedTabSize(): number { return Math.min(8, Math.max(1, Math.trunc(finite(this.tabSize, 2)))) }
    protected normalizedMinLines(): number { return Math.max(2, Math.trunc(finite(this.minLines, 8))) }
    protected normalizedMaxLines(): number { return Math.max(this.normalizedMinLines(), Math.trunc(finite(this.maxLines, 32))) }
    protected mount(): void { this.sourceValue.mount(); super.mount() }
    protected update(name: string): void {
        if (name === 'value') {
            if (this.sourceValue.isReflecting) return
            this.sourceValue.readAttribute()
        }
        super.update(name)
    }

    setValue(value: string, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const next = scalarText(value)
        if (next === this.sourceText()) return false
        const detail = { value: next, originalEvent }
        if (!this.request('beforechange', detail)) { this.syncView(); return false }
        this.sourceValue.set(next, false)
        this.syncView()
        this.emit('change', detail)
        return true
    }

    protected editJson(event: KeyboardEvent): boolean {
        const editor = this.editorElement()
        if (!editor || scalarText(this.language).toLowerCase() !== 'json' || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || this.unavailable || bool(this.readOnly)) return false
        const value = editor.value
        const start = editor.selectionStart
        const end = editor.selectionEnd
        const selection = value.slice(start, end)
        const key = event.shiftKey && event.code === 'Semicolon' ? ':' : event.key
        const pairs: Readonly<Record<string, string>> = { '{': '}', '[': ']', '"': '"' }
        const apply = (rangeStart: number, rangeEnd: number, replacement: string, selectionStart: number, selectionEnd = selectionStart, inputType = 'insertText'): boolean => {
            event.preventDefault()
            editor.setSelectionRange(rangeStart, rangeEnd)
            const nativeEdit = document.execCommand('insertText', false, replacement)
            if (!nativeEdit) {
                editor.setRangeText(replacement, rangeStart, rangeEnd, 'end')
                editor.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType, data: replacement }))
            }
            editor.setSelectionRange(selectionStart, selectionEnd)
            return true
        }
        if (key === 'Backspace' && start === end && start > 0 && pairs[value[start - 1] ?? ''] === value[start]) {
            return apply(start - 1, start + 1, '', start - 1, start - 1, 'deleteContentBackward')
        }
        if (key === 'Enter' && !this.insideJsonString(value, start)) {
            const before = value.slice(0, start)
            const after = value.slice(end)
            const lineStart = before.lastIndexOf('\n') + 1
            const currentIndent = before.slice(lineStart).match(/^[\t ]*/)?.[0] ?? ''
            const previous = before.trimEnd().at(-1) ?? ''
            const next = after.trimStart().at(0) ?? ''
            const opensBlock = (previous === '{' && next === '}') || (previous === '[' && next === ']')
            const continuedIndent = `${currentIndent}${previous === '{' || previous === '[' ? ' '.repeat(this.normalizedTabSize()) : ''}`
            const replacement = opensBlock ? `\n${continuedIndent}\n${currentIndent}` : `\n${continuedIndent}`
            return apply(start, end, replacement, start + 1 + continuedIndent.length, undefined, 'insertLineBreak')
        }
        if ((key === '}' || key === ']' || key === '"') && start === end && value[start] === key) {
            event.preventDefault()
            editor.setSelectionRange(start + 1, start + 1)
            return true
        }
        if (key === ':' && start === end && !this.insideJsonString(value, start) && value[start] !== ' ' && value[start] !== '\t') {
            return apply(start, end, ': ', start + 2)
        }
        const closing = pairs[key]
        if (!closing || key === '"' && start === end && this.insideJsonString(value, start)) return false
        const replacement = `${key}${selection}${closing}`
        return selection
            ? apply(start, end, replacement, start + 1, end + 1)
            : apply(start, end, replacement, start + 1)
    }

    private insideJsonString(value: string, position: number): boolean {
        let inside = false
        let escaped = false
        for (let index = 0; index < position; index += 1) {
            const character = value[index]
            if (escaped) { escaped = false; continue }
            if (character === '\\') { escaped = true; continue }
            if (character === '"') inside = !inside
        }
        return inside
    }

    protected indent(event: KeyboardEvent): boolean {
        const editor = this.editorElement()
        if (!editor || event.key !== 'Tab' || this.unavailable || bool(this.readOnly)) return false
        event.preventDefault()
        const value = editor.value
        const start = editor.selectionStart
        const end = editor.selectionEnd
        const indentation = ' '.repeat(this.normalizedTabSize())
        if (event.shiftKey) {
            const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1
            const selected = value.slice(lineStart, end)
            const unindented = selected.replace(new RegExp(`^ {1,${this.normalizedTabSize()}}`, 'gm'), '')
            if (!this.setValue(value.slice(0, lineStart) + unindented + value.slice(end), event)) return false
            queueMicrotask(() => editor.setSelectionRange(lineStart, lineStart + unindented.length))
            return true
        }
        if (start !== end && value.slice(start, end).includes('\n')) {
            const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1
            const selected = value.slice(lineStart, end)
            const indented = indentation + selected.replaceAll('\n', `\n${indentation}`)
            if (!this.setValue(value.slice(0, lineStart) + indented + value.slice(end), event)) return false
            queueMicrotask(() => editor.setSelectionRange(lineStart, lineStart + indented.length))
            return true
        }
        if (!this.setValue(value.slice(0, start) + indentation + value.slice(end), event)) return false
        queueMicrotask(() => editor.setSelectionRange(start + indentation.length, start + indentation.length))
        return true
    }

    protected submit(event: KeyboardEvent): boolean {
        if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) return false
        event.preventDefault()
        const detail = { value: this.sourceText(), originalEvent: event }
        if (!this.request('beforesubmit', detail)) return false
        this.emit('submit', detail)
        return true
    }
}
