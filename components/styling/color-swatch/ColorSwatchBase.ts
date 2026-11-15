import { FormControlBase, type FormControlProps, type FormRestoreValue } from '../../form/FormControlBase.js'
import { bool } from '../../core/value.js'
import { normalizeColor, parseHexColor } from '../color-picker/color.js'

export type ColorSwatchVariant = 'round' | 'boxy'
export interface ColorSwatchOption {
    value: string
    label?: string
    disabled?: boolean
}
export interface ColorSwatchProps extends FormControlProps {
    value?: string
    selected?: boolean
    variant?: ColorSwatchVariant
    options?: readonly (string | ColorSwatchOption)[]
}

/** Single-color previews and form-associated palette selection. */
export abstract class ColorSwatchBase extends FormControlBase<ColorSwatchProps> {
    static observedAttributes = [...FormControlBase.observedAttributes, 'selected', 'variant', 'options']
    value = '#2563eb'
    selected = false
    variant: ColorSwatchVariant = 'boxy'
    options: readonly (string | ColorSwatchOption)[] = []

    protected hasOptions = (): boolean => Array.isArray(this.options) && this.options.length > 0
    get normalizedOptions(): readonly ColorSwatchOption[] {
        const colors = new Set<string>()
        if (!Array.isArray(this.options)) return []
        return this.options.flatMap(option => {
            const entry: ColorSwatchOption = typeof option === 'string' ? { value: option } : option
            if (!entry || typeof entry.value !== 'string' || !parseHexColor(entry.value)) return []
            const value = normalizeColor(entry.value)
            if (colors.has(value)) return []
            colors.add(value)
            return [{ value, label: entry.label || value, disabled: bool(entry.disabled) }]
        })
    }
    choose(value: string, originalEvent?: Event): boolean {
        const option = this.normalizedOptions.find(option => option.value === value)
        return Boolean(option && !option.disabled && this.handleChange(option.value, originalEvent))
    }
    protected fieldElement(): undefined { return undefined }
    protected captureValue(): string { return this.value }
    protected restoreValue(value: FormRestoreValue): void {
        const restored = value instanceof FormData ? value.get(this.name) : value
        this.value = typeof restored === 'string' ? restored : ''
    }

    protected displayColor = (): string => normalizeColor(this.value, '#00000000')
    protected swatchLabel = (): string => this.accessibleName() || this.displayColor()
    protected activate(originalEvent: Event): void {
        if (this.unavailable) return
        const detail = { value: this.displayColor(), originalEvent }
        if (this.request('beforeaction', detail)) this.emit('action', detail)
    }
    protected isSelected = (): boolean => bool(this.selected)
}
