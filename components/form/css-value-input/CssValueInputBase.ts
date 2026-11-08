import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from '../FormControlBase.js'
import { normalizeOptions, type SelectOption } from '../model.js'
import { state } from '../../core/runtime.js'
import { bool, scalarText } from '../../core/value.js'
import { cssFunctionValue, cssNumericValue, type CssFunctionValue } from './model.js'

export type CssValueSuggestion = string | SelectOption
export interface CssValueInputProps extends FieldControlProps<string> {
    suggestions?: readonly CssValueSuggestion[]
    units?: readonly CssValueSuggestion[]
    defaultUnit?: string
    cssProperty?: string
    placeholder?: string
    unitLabel?: string
    argumentLabel?: string
    open?: boolean
    expandFunctions?: boolean
    step?: number
}
export interface CssValueInputDetail { readonly value: string; readonly valid: boolean; readonly originalEvent?: Event }

/** A single CSS declaration value, not a combined width/min-width/max-width policy. */
export abstract class CssValueInputBase extends FieldControlBase<CssValueInputProps> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'suggestions', 'units', 'default-unit', 'css-property', 'placeholder', 'unit-label', 'argument-label', 'open', 'expand-functions', 'step']
    value = ''
    suggestions: readonly CssValueSuggestion[] = []
    units: readonly CssValueSuggestion[] = ['px', '%', 'em', 'rem', 'vw', 'vh']
    defaultUnit = 'px'
    cssProperty = 'width'
    placeholder = ''
    unitLabel = ''
    argumentLabel = ''
    open = false
    expandFunctions = true
    step = 1
    protected readonly draft: ReturnType<typeof state<string>> = state('')
    private readonly structured = state<CssFunctionValue | null>(null)
    protected readonly focused: ReturnType<typeof state<boolean>> = state(false)
    protected readonly preferredUnit: ReturnType<typeof state<string>> = state('')
    protected captureValue(): string { return scalarText(this.value) }
    protected restoreValue(value: string | FormRestoreValue): void {
        this.value = value instanceof FormData ? scalarText(value.get(this.name)) : scalarText(value)
        this.structured[1](null)
        this.draft[1](this.value)
    }
    protected mount(): void {
        this.draft[1](scalarText(this.value))
        this.preferredUnit[1](this.numericValue()?.unit ?? this.defaultUnit)
        super.mount()
    }
    protected update(name: string): void {
        // Source saves and computed snapshots can arrive between keystrokes.
        // They must not replace a partial or cleared focused draft.
        if (name === 'value' && !this.focused[0]()) { this.structured[1](null); this.draft[1](scalarText(this.value)) }
        if (this.unavailable || bool(this.readOnly)) this.setOpen(false)
        super.update(name)
    }
    protected functionValue = () => bool(this.expandFunctions) ? this.structured[0]() || cssFunctionValue(this.draft[0]()) : null
    protected numericValue = () => cssNumericValue(this.draft[0]())
    protected selectedUnit = (): string => this.numericValue()?.unit ?? this.preferredUnit[0]()
    protected unitOptions = () => {
        const options = normalizeOptions(this.props.units?.()), selected = this.selectedUnit()
        return selected && !options.some(option => option.value === selected) ? [...options, { value: selected, label: selected, disabled: false }] : options
    }
    protected displayValue = (): string => this.functionValue()?.name || this.numericValue()?.number || this.draft[0]()
    protected filteredSuggestions = () => {
        if (this.numericValue()) return []
        const query = this.displayValue().trim().toLocaleLowerCase()
        return normalizeOptions(this.props.suggestions?.()).filter(option => !query || option.label.toLocaleLowerCase().includes(query) || option.value.toLocaleLowerCase().includes(query))
    }
    protected validDraft = (): boolean => !this.draft[0]() || CSS.supports(this.cssProperty, this.draft[0]())
    protected edit = (value: string, originalEvent?: Event): void => {
        if (!this.canChangeValue()) return
        this.draft[1](value)
        const valid = this.validDraft()
        this.emit('input', { value, valid, originalEvent } satisfies CssValueInputDetail)
        if (valid) this.handleChange(value, originalEvent)
        this.syncFormValue()
        this.syncView()
    }
    setValue(value: string, originalEvent?: Event): boolean {
        if (!this.canChangeValue() || value && !CSS.supports(this.cssProperty, value)) return false
        const accepted = this.handleChange(value, originalEvent)
        if (accepted || value === this.value) { this.structured[1](null); this.draft[1](value) }
        return accepted
    }
    protected editText = (value: string, originalEvent?: Event): void => {
        const functionName = /^(min|max|clamp)(?:\(\))?$/u.exec(value.trim())?.[1]
        if (functionName && bool(this.expandFunctions)) {
            const current = this.draft[0]()
            const operand = cssNumericValue(current) || /^(calc|var)\(/u.test(current) && CSS.supports(this.cssProperty, current) ? current : ''
            const previous = this.functionValue()?.arguments || [operand, '']
            const args = functionName === 'clamp' ? [previous[0] || '', previous[1] || '', previous[2] || ''] : previous
            this.structured[1]({ name: functionName as CssFunctionValue['name'], arguments: args })
            this.edit(`${functionName}(${args.join(', ')})`, originalEvent)
        } else {
            this.structured[1](null)
            const numeric = cssNumericValue(value)
            if (numeric?.unit) this.preferredUnit[1](numeric.unit)
            this.edit(numeric && !numeric.unit ? `${value}${this.selectedUnit()}` : value, originalEvent)
        }
    }
    protected editArgument = (index: number, value: string, originalEvent?: Event): void => {
        const current = this.functionValue()
        if (!current) return
        const args = current.arguments.map((argument, position) => position === index ? value : argument)
        // An unclosed nested calc()/var() is still an argument draft, not a
        // request to dismantle the entire function field while it has focus.
        this.structured[1]({ name: current.name, arguments: args })
        this.edit(`${current.name}(${args.join(', ')})`, originalEvent)
    }
    protected chooseUnit = (unit: string, originalEvent?: Event): void => {
        if (!this.canChangeValue()) return
        this.preferredUnit[1](unit)
        const numeric = this.numericValue()
        if (numeric) this.edit(`${numeric.number}${unit}`, originalEvent)
    }
    protected stepNumeric = (direction: 1 | -1, event: KeyboardEvent): void => {
        const numeric = this.numericValue()
        if (!numeric || !this.canChangeValue()) return
        const step = Number.isFinite(Number(this.step)) && Number(this.step) > 0 ? Number(this.step) : 1
        const next = Number((Number(numeric.number) + direction * step * (event.shiftKey ? 10 : event.altKey ? .1 : 1)).toPrecision(15))
        const value = `${next}${numeric.unit}`
        // Keep valid CSS valid (for example, font size cannot step below zero).
        if (!Number.isFinite(next) || !CSS.supports(this.cssProperty, value)) return
        this.edit(value, event)
    }
    setOpen(open: boolean, originalEvent?: Event): void {
        const next = open && this.canChangeValue() && !this.numericValue() && this.filteredSuggestions().length > 0
        if (bool(this.open) === next) return
        this.open = next
        this.syncView()
        this.emit(next ? 'open' : 'close', { open: next, originalEvent })
    }
}
