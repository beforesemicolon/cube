import { bool, finite } from '../../core/value.js'
import { FormFieldBase, type FormFieldProps } from '../../form/FormFieldBase.js'
import { colorToHex, normalizeColor, parseHexColor, type HSVAColor } from './color.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength } from '../../core/popup.js'

export interface ColorPickerProps extends FormFieldProps, PopupConstraintProps {
    value?: string
    native?: boolean
    open?: boolean
    allowAlpha?: boolean
    allowSampler?: boolean
    swatches?: readonly string[]
    recentColors?: readonly string[]
    maxRecent?: number
    hueLabel?: string
    saturationLabel?: string
    valueLabel?: string
    alphaLabel?: string
    redLabel?: string
    greenLabel?: string
    blueLabel?: string
    hexLabel?: string
    planeLabel?: string
    samplerLabel?: string
    closeLabel?: string
    swatchesLabel?: string
    addSwatchLabel?: string
    removeSwatchLabel?: string
    transparentLabel?: string
}

export interface ColorPickerChangeDetail {
    readonly value: string
    readonly color: HSVAColor
    readonly originalEvent?: Event
}

export interface ColorPickerSwatchDetail {
    readonly value: string
    readonly swatches: readonly string[]
    readonly recentColors: readonly string[]
    readonly originalEvent?: Event
}

/** Renderer-independent color state, form behavior and cancelable interactions. */
export abstract class ColorPickerBase extends FormFieldBase<ColorPickerProps> {
    static observedAttributes = [
        ...FormFieldBase.observedAttributes, 'value', 'native', 'open', 'allow-alpha', 'allow-sampler', 'swatches',
        'recent-colors', 'max-recent', 'hue-label', 'saturation-label', 'value-label', 'alpha-label', 'red-label',
        'green-label', 'blue-label', 'hex-label', 'plane-label', 'sampler-label', 'close-label', 'swatches-label',
        'add-swatch-label', 'remove-swatch-label', 'transparent-label',
        ...popupConstraintAttributes,
    ]

    value = '#000000'
    native = false
    open = false
    allowAlpha = true
    allowSampler = true
    swatches: readonly string[] = []
    recentColors: readonly string[] = []
    maxRecent = 8
    hueLabel = 'H'
    saturationLabel = 'S'
    valueLabel = 'V'
    alphaLabel = 'A'
    redLabel = 'R'
    greenLabel = 'G'
    blueLabel = 'B'
    hexLabel = 'HEX'
    planeLabel = ''
    samplerLabel = ''
    closeLabel = ''
    swatchesLabel = ''
    addSwatchLabel = ''
    removeSwatchLabel = ''
    transparentLabel = ''
    popupMaxWidth: PopupLength = '344px'
    popupMaxHeight: PopupLength = '640px'

    protected captureValue(): string { return this.normalizedValue() }
    protected restoreValue(value: string | File | FormData | null): void {
        const restored = typeof value === 'string' ? value : value instanceof FormData ? value.get(this.name) : ''
        this.value = normalizeColor(typeof restored === 'string' ? restored : '')
    }

    normalizedValue(): string { return normalizeColor(this.value) }
    color(): HSVAColor { return parseHexColor(this.normalizedValue()) ?? { hue: 0, saturation: 0, value: 0, alpha: 1 } }

    setOpen(open: boolean, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly) || bool(this.native)) return false
        if (bool(this.open) === open) return true
        const detail = { open, originalEvent }
        if (!this.request(open ? 'cb-before-open' : 'cb-before-close', detail)) return false
        this.open = open
        this.toggleAttribute('open', open)
        this.syncView()
        this.emit(open ? 'cb-open' : 'cb-close', detail)
        this.emit('cb-open-change', detail)
        return true
    }

    inputColor(color: HSVAColor, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const next = colorToHex({ ...color, alpha: bool(this.allowAlpha) ? color.alpha : 1 })
        const detail: ColorPickerChangeDetail = { value: next, color: parseHexColor(next) ?? color, originalEvent }
        if (!this.request('cb-before-input', detail)) return false
        this.value = next
        this.syncView()
        this.emit('cb-input', detail)
        return true
    }

    changeColor(color: HSVAColor, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const next = colorToHex({ ...color, alpha: bool(this.allowAlpha) ? color.alpha : 1 })
        const detail: ColorPickerChangeDetail = { value: next, color: parseHexColor(next) ?? color, originalEvent }
        if (!this.request('cb-before-change', detail)) return false
        this.value = next
        this.syncView()
        this.emit('cb-change', detail)
        return true
    }

    choose(value: string, originalEvent?: Event): boolean {
        const color = parseHexColor(value)
        return color ? this.changeColor(color, originalEvent) : false
    }

    addSwatch(value = this.normalizedValue(), originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const color = parseHexColor(value)
        if (!color) return false
        const normalized = colorToHex(color)
        const swatches = this.normalizedColors(this.swatches)
        if (swatches.includes(normalized)) return true
        const detail: ColorPickerSwatchDetail = {
            value: normalized,
            swatches: [...swatches, normalized],
            recentColors: this.normalizedColors(this.recentColors),
            originalEvent,
        }
        if (!this.request('cb-before-swatch-add', detail)) return false
        this.swatches = detail.swatches
        this.syncView()
        this.emit('cb-swatch-add', detail)
        return true
    }

    removeSwatch(value: string, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const color = parseHexColor(value)
        if (!color) return false
        const normalized = colorToHex(color)
        const currentSwatches = this.normalizedColors(this.swatches)
        const currentRecent = this.normalizedColors(this.recentColors)
        const swatches = currentSwatches.filter(candidate => candidate !== normalized)
        const recentColors = currentRecent.filter(candidate => candidate !== normalized)
        if (swatches.length === currentSwatches.length && recentColors.length === currentRecent.length) return false
        const detail: ColorPickerSwatchDetail = { value: normalized, swatches, recentColors, originalEvent }
        if (!this.request('cb-before-swatch-remove', detail)) return false
        this.swatches = detail.swatches
        this.recentColors = detail.recentColors
        this.syncView()
        this.emit('cb-swatch-remove', detail)
        return true
    }

    palette(): readonly string[] {
        const limit = Math.max(0, Math.round(finite(this.maxRecent, 8)))
        return this.normalizedColors([...this.swatches, ...this.recentColors.slice(0, limit)])
    }

    private normalizedColors(source: readonly string[]): string[] {
        const seen = new Set<string>()
        const colors: string[] = []
        for (const value of source) {
            const color = parseHexColor(value)
            if (!color) continue
            const normalized = colorToHex(color)
            if (!seen.has(normalized)) { seen.add(normalized); colors.push(normalized) }
        }
        return colors
    }
}
