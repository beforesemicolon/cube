import { bool, finite } from '../../core/value.js'
import { FieldControlBase, type FieldControlProps } from '../../form/FormControlBase.js'
import { colorToHex, normalizeColor, parseHexColor, type HSVAColor } from './color.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength } from '../../core/popup.js'

export interface ColorPickerProps extends FieldControlProps, PopupConstraintProps {
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
    updateSwatchLabel?: string
    removeSwatchLabel?: string
    transparentLabel?: string
}

export interface ColorPickerChangeDetail {
    readonly value: string
    readonly previousValue: string
    readonly color: HSVAColor
    readonly originalEvent?: Event
}

export interface ColorPickerSwatchDetail {
    readonly value: string
    readonly swatches: readonly string[]
    readonly recentColors: readonly string[]
    readonly originalEvent?: Event
}
export interface ColorPickerSwatchUpdateDetail extends ColorPickerSwatchDetail { readonly previousValue: string }

/** Renderer-independent color state, form behavior and cancelable interactions. */
export abstract class ColorPickerBase extends FieldControlBase<ColorPickerProps> {
    static observedAttributes = [
        ...FieldControlBase.observedAttributes, 'value', 'native', 'open', 'allow-alpha', 'allow-sampler', 'swatches',
        'recent-colors', 'max-recent', 'hue-label', 'saturation-label', 'value-label', 'alpha-label', 'red-label',
        'green-label', 'blue-label', 'hex-label', 'plane-label', 'sampler-label', 'close-label', 'swatches-label',
        'add-swatch-label', 'update-swatch-label', 'remove-swatch-label', 'transparent-label',
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
    updateSwatchLabel = ''
    removeSwatchLabel = ''
    transparentLabel = ''
    popupMaxWidth: PopupLength = '344px'
    popupMaxHeight: PopupLength = '640px'

    protected captureValue(): string { return this.normalizedValue() }
    protected restoreValue(value: string | File | FormData | null): void {
        const restored = typeof value === 'string' ? value : value instanceof FormData ? value.get(this.name) : ''
        this.value = normalizeColor(typeof restored === 'string' ? restored : '')
    }
    protected serializedValue():string{return this.normalizedValue()}

    normalizedValue(): string { return normalizeColor(this.value) }
    color(): HSVAColor { return parseHexColor(this.normalizedValue()) ?? { hue: 0, saturation: 0, value: 0, alpha: 1 } }

    setOpen(open: boolean, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly) || bool(this.native)) return false
        if (bool(this.open) === open) return true
        const detail = { open, originalEvent }
        if (!this.request(open ? 'beforeopen' : 'beforeclose', detail)) return false
        this.open = open
        this.toggleAttribute('open', open)
        this.syncView()
        this.emit(open ? 'open' : 'close', detail)
        this.emit('openchange', detail)
        return true
    }

    inputColor(color: HSVAColor, originalEvent?: Event): boolean {
        return this.changeColor(color, originalEvent)
    }

    changeColor(color: HSVAColor, originalEvent?: Event): boolean {
        const next = colorToHex({ ...color, alpha: bool(this.allowAlpha) ? color.alpha : 1 })
        if (next === this.normalizedValue()) return false
        const detail:Omit<ColorPickerChangeDetail,'value'|'previousValue'|'originalEvent'>={color:parseHexColor(next)??color}
        return this.commitValue(next,originalEvent,detail)
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
        if (!this.request('beforeswatchadd', detail)) return false
        this.swatches = detail.swatches
        this.syncView()
        this.emit('swatchadd', detail)
        return true
    }

    updateSwatch(previousValue: string, value = this.normalizedValue(), originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const previous = parseHexColor(previousValue), next = parseHexColor(value)
        if (!previous || !next) return false
        const previousColor = colorToHex(previous), normalized = colorToHex(next)
        const current = this.normalizedColors(this.swatches)
        if (!current.includes(previousColor) || previousColor === normalized) return false
        const detail: ColorPickerSwatchUpdateDetail = {
            previousValue: previousColor, value: normalized,
            swatches: this.normalizedColors(current.map(color => color === previousColor ? normalized : color)),
            recentColors: this.normalizedColors(this.recentColors), originalEvent,
        }
        if (!this.request('beforeswatchupdate', detail)) return false
        this.swatches = detail.swatches
        this.syncView()
        this.emit('swatchupdate', detail)
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
        if (!this.request('beforeswatchremove', detail)) return false
        this.swatches = detail.swatches
        this.recentColors = detail.recentColors
        this.syncView()
        this.emit('swatchremove', detail)
        return true
    }

    protected savedSwatches = (): readonly string[] => this.normalizedColors(this.props.swatches?.() || [])
    palette(): readonly string[] {
        const limit = Math.max(0, Math.round(finite(this.props.maxRecent?.(), 8)))
        return this.normalizedColors([...this.savedSwatches(), ...(this.props.recentColors?.() || []).slice(0, limit)])
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
