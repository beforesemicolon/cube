import { FormFieldBase, type FormFieldProps } from '../FormFieldBase.js'
import { bool, finite, scalarText } from '../../core/value.js'
import { SourceValueController } from '../source-value.js'

export type CodeEditorValue = string | number | boolean | null | readonly CodeEditorValue[] | { readonly [key: string]: CodeEditorValue }

export interface CodeEditorProps extends FormFieldProps {
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
export abstract class CodeEditorBase<P extends CodeEditorProps = CodeEditorProps> extends FormFieldBase<P> {
    static observedAttributes = [
        ...FormFieldBase.observedAttributes, 'value', 'language', 'placeholder', 'line-numbers', 'wrap', 'tab-size',
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

    setValue(value: string, originalEvent?: Event, commit = false): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const next = scalarText(value)
        const detail = { value: next, originalEvent }
        if (!this.request('cb-before-change', detail)) { this.syncView(); return false }
        this.sourceValue.set(next, false)
        this.syncView()
        this.emit(commit ? 'cb-change' : 'cb-input', detail)
        return true
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
        if (!this.request('cb-before-submit', detail)) return false
        this.emit('cb-submit', detail)
        return true
    }
}
