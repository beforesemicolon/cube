import { FormFieldBase, type FormFieldProps } from '../FormFieldBase.js'
import { bool, scalarText } from '../../core/value.js'

export interface MaskedInputProps extends FormFieldProps {
    value?: string
    mask?: string
    placeholder?: string
    maskPlaceholder?: string
    guide?: boolean
    unmask?: boolean
    inputMode?: string
    autocomplete?: string
}

interface MaskSlot { readonly literal?: string; readonly pattern?: RegExp }

function slotsFor(mask: string): readonly MaskSlot[] {
    const slots: MaskSlot[] = []
    let escaped = false
    for (const character of scalarText(mask)) {
        if (escaped) { slots.push({ literal: character }); escaped = false; continue }
        if (character === '\\') { escaped = true; continue }
        if (character === '9') slots.push({ pattern: /[0-9]/ })
        else if (character === 'A') slots.push({ pattern: /[A-Za-z]/ })
        else if (character === '*') slots.push({ pattern: /[A-Za-z0-9]/ })
        else slots.push({ literal: character })
    }
    if (escaped) slots.push({ literal: '\\' })
    return slots
}

export function formatMaskedValue(value: string, mask: string): string {
    const slots = slotsFor(mask)
    if (!slots.length) return scalarText(value)
    const input = [...scalarText(value)]
    let inputIndex = 0
    let output = ''
    for (const slot of slots) {
        if (slot.literal !== undefined) {
            if (inputIndex < input.length) output += slot.literal
            if (input[inputIndex] === slot.literal) inputIndex += 1
            continue
        }
        while (inputIndex < input.length) {
            const character = input[inputIndex++] ?? ''
            if (slot.pattern?.test(character)) { output += character; break }
        }
    }
    return output
}

export function unmaskValue(value: string, mask: string): string {
    const formatted = formatMaskedValue(value, mask)
    const slots = slotsFor(mask)
    let result = ''
    let index = 0
    for (const slot of slots) {
        const character = formatted[index]
        if (character === undefined) break
        if (slot.literal !== undefined) { if (character === slot.literal) index += 1; continue }
        if (slot.pattern?.test(character)) result += character
        index += 1
    }
    return result
}

/** Deterministic input-mask behavior. Tokens are 9 (digit), A (letter), and * (alphanumeric). */
export abstract class MaskedInputBase<P extends MaskedInputProps = MaskedInputProps> extends FormFieldBase<P> {
    static observedAttributes = [
        ...FormFieldBase.observedAttributes, 'value', 'mask', 'placeholder', 'mask-placeholder', 'guide', 'unmask', 'input-mode', 'autocomplete',
    ]
    value = ''
    mask = ''
    placeholder = ''
    maskPlaceholder = '_'
    guide = true
    unmask = false
    inputMode = 'text'
    autocomplete = 'off'

    protected captureValue(): string { return scalarText(this.value) }
    protected restoreValue(value: unknown): void { this.value = formatMaskedValue(scalarText(value), this.mask) }
    protected formattedValue(): string { return formatMaskedValue(this.value, this.mask) }
    protected submittedValue(): string { return bool(this.unmask) ? unmaskValue(this.value, this.mask) : this.formattedValue() }
    protected maskGuide(): string {
        if (!bool(this.guide)) return scalarText(this.placeholder)
        const placeholder = scalarText(this.maskPlaceholder, '_').charAt(0) || '_'
        return slotsFor(this.mask).map(slot => slot.literal ?? placeholder).join('') || scalarText(this.placeholder)
    }

    setValue(value: string, originalEvent?: Event, commit = false): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const next = formatMaskedValue(value, this.mask)
        const detail = { value: next, rawValue: unmaskValue(next, this.mask), originalEvent }
        if (!this.request(commit ? 'cb-before-change' : 'cb-before-input', detail)) return false
        this.value = next
        if (commit) this.validationShown = true
        this.syncView()
        this.emit(commit ? 'cb-change' : 'cb-input', detail)
        return true
    }
}
