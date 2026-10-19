import { FormControlBase, type FormControlProps } from '../FormControlBase.js'
import { bool, scalarText } from '../../core/value.js'
import { formatMaskedValue, maskSlotsFor, unmaskValue } from './mask.js'

export interface MaskedInputProps extends FormControlProps {
    value?: string
    mask?: string
    placeholder?: string
    maskPlaceholder?: string
    guide?: boolean
    unmask?: boolean
    inputMode?: string
    autocomplete?: string
}

/** Deterministic input-mask behavior. Tokens are 9 (digit), A (letter), and * (alphanumeric). */
export abstract class MaskedInputBase<P extends MaskedInputProps = MaskedInputProps> extends FormControlBase<P> {
    static observedAttributes = [
        ...FormControlBase.observedAttributes, 'value', 'mask', 'placeholder', 'mask-placeholder', 'guide', 'unmask', 'input-mode', 'autocomplete',
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
    get rawValue(): string { return unmaskValue(this.value, this.mask) }
    protected submittedValue(): string { return bool(this.unmask) ? unmaskValue(this.value, this.mask) : this.formattedValue() }
    protected maskGuide(): string {
        if (!bool(this.guide)) return scalarText(this.placeholder)
        const placeholder = scalarText(this.maskPlaceholder, '_').charAt(0) || '_'
        return maskSlotsFor(this.mask).map(slot => slot.literal ?? placeholder).join('') || scalarText(this.placeholder)
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

export { formatMaskedValue, unmaskValue } from './mask.js'
