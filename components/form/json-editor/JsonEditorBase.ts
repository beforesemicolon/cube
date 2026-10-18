import { FormFieldBase, type FormFieldProps } from '../FormFieldBase.js'
import { bool, finite, scalarText } from '../../core/value.js'
import { SourceValueController } from '../source-value.js'

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
export type JsonValidator = (value: JsonValue) => string
export interface JsonEditorProps extends FormFieldProps {
    value?: string | JsonValue
    indent?: number
    validator?: JsonValidator
    formatLabel?: string
    validLabel?: string
    invalidLabel?: string
    placeholder?: string
    lineNumbers?: boolean
    wrap?: boolean
    positionLabel?: string
}

function isJsonValue(value: unknown): value is JsonValue {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
    if (typeof value === 'number') return Number.isFinite(value)
    if (Array.isArray(value)) return value.every(isJsonValue)
    if (typeof value !== 'object') return false
    return Object.values(value).every(isJsonValue)
}

/** JSON parsing, formatting and schema-adapter validation independent from rendering. */
export abstract class JsonEditorBase<P extends JsonEditorProps = JsonEditorProps> extends FormFieldBase<P> {
    static observedAttributes = [
        ...FormFieldBase.observedAttributes, 'value', 'indent', 'format-label', 'valid-label', 'invalid-label', 'placeholder',
        'line-numbers', 'wrap', 'position-label',
    ]
    declare value: string | JsonValue
    private readonly sourceValue: SourceValueController<string | JsonValue>
    indent = 2
    validator?: JsonValidator
    formatLabel = ''
    validLabel = ''
    invalidLabel = ''
    placeholder = ''
    lineNumbers = true
    wrap = false
    positionLabel = ''

    constructor() {
        super()
        this.sourceValue = new SourceValueController<string | JsonValue>(
            this,
            '',
            value => value ?? '',
            value => typeof value === 'string' || value === null || typeof value === 'number' || typeof value === 'boolean'
                ? value === null ? 'null' : scalarText(value)
                : null,
            () => this.syncView(),
        )
    }

    protected abstract nestedEditor(): HTMLElement | undefined
    protected fieldElement(): undefined { return undefined }
    protected sourceText(): string {
        if (typeof this.value === 'string') return this.value
        return isJsonValue(this.value) ? JSON.stringify(this.value, null, Math.min(8, Math.max(0, Math.trunc(finite(this.indent, 2))))) : ''
    }
    protected captureValue(): string { return this.sourceText() }
    protected restoreValue(value: unknown): void {
        this.sourceValue.set(value instanceof FormData ? scalarText(value.get(this.name)) : scalarText(value), false)
    }

    protected mount(): void { this.sourceValue.mount(); super.mount() }
    protected update(name: string): void {
        if (name === 'value') {
            if (this.sourceValue.isReflecting) return
            this.sourceValue.readAttribute()
        }
        super.update(name)
    }

    parse(): { value?: JsonValue; error: string } {
        const source = this.sourceText().trim()
        if (!source) return bool(this.required) ? { error: scalarText(this.invalidLabel) } : { value: null, error: '' }
        try {
            const parsed: unknown = JSON.parse(source)
            if (!isJsonValue(parsed)) return { error: scalarText(this.invalidLabel) }
            const validation = this.validator?.(parsed) ?? ''
            return validation ? { value: parsed, error: validation } : { value: parsed, error: '' }
        } catch (cause) { return { error: cause instanceof Error ? cause.message : scalarText(this.invalidLabel) } }
    }

    setValue(value: string, originalEvent?: Event, commit = false): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const next = scalarText(value)
        const detail = { value: next, originalEvent }
        if (!this.request('cb-before-change', detail)) { this.syncView(); return false }
        this.sourceValue.set(next, false)
        this.validationShown = commit
        this.syncView()
        this.emit(commit ? 'cb-change' : 'cb-input', detail)
        return true
    }

    format(originalEvent?: Event): boolean {
        const parsed = this.parse()
        if (parsed.error || parsed.value === undefined) { this.validationShown = true; this.syncView(); return false }
        const next = JSON.stringify(parsed.value, null, Math.min(8, Math.max(0, Math.trunc(finite(this.indent, 2)))))
        if (!this.setValue(next, originalEvent, true)) return false
        this.emit('cb-format', { value: next, originalEvent })
        return true
    }

    protected syncJsonForm(): string {
        const parsed = this.parse()
        const error = scalarText(this.errorText) || parsed.error
        const source = this.sourceText()
        this.internals?.setFormValue(this.unavailable ? null : source, source)
        this.internals?.setValidity(error ? { customError: true } : {}, error)
        return error
    }
}
