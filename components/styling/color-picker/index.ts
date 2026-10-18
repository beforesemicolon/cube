import { actionLabel, createIconButton } from '../../action/create.js'
import type { IconButton } from '../../action/icon-button/index.js'
import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet, uid } from '../../core/editor-dom.js'
import { PopupController } from '../../core/popup.js'
import { bool, clamp, finite, text } from '../../core/value.js'
import { token as v } from '../../theme/tokens.js'
import { ColorPickerBase } from './ColorPickerBase.js'
import { colorToHex, hsvaToRgba, parseHexColor, rgbaToHsva, type HSVAColor, type RGBAColor } from './color.js'

const css = editorCSS + `
:host{display:inline-block;inline-size:auto;min-inline-size:0}
[part~=root]{display:grid;gap:var(--spacing-xs,4px);justify-items:start;min-inline-size:0}
[part~=trigger],[part~=native]{position:relative;display:block;inline-size:var(--component-color-picker-trigger-size,36px);min-inline-size:var(--component-color-picker-trigger-size,36px);block-size:var(--component-color-picker-trigger-size,36px);min-block-size:var(--component-color-picker-trigger-size,36px);padding:3px;overflow:hidden;border:1px solid ${v('--color-border')};border-radius:var(--component-color-picker-radius,var(--radius-sm));background:conic-gradient(${v('--color-separator')} 25%,${v('--color-surface')} 0 50%,${v('--color-separator')} 0 75%,${v('--color-surface')} 0) 0 0/10px 10px}
[part~=trigger]:hover:not(:disabled){border-color:${v('--color-primary')};background:conic-gradient(${v('--color-separator')} 25%,${v('--color-surface')} 0 50%,${v('--color-separator')} 0 75%,${v('--color-surface')} 0) 0 0/10px 10px}
[part~=trigger-swatch]{display:block;inline-size:100%;block-size:100%;border-radius:calc(var(--component-color-picker-radius,var(--radius-sm)) - 3px);background:var(--cb-selected-color)}
[part~=native]{appearance:auto;color-scheme:inherit;cursor:pointer}
[part~=native]::-webkit-color-swatch-wrapper{padding:0}[part~=native]::-webkit-color-swatch{border:0;border-radius:calc(var(--component-color-picker-radius,var(--radius-sm)) - 3px)}
[part~=popup]{z-index:var(--z-index-popover,1000);container-type:inline-size;display:grid;gap:var(--spacing-md,12px);inline-size:min(var(--component-color-picker-popup-width,344px),calc(100vw - 16px));box-sizing:border-box;padding:var(--spacing-md,12px);overflow:auto;border:1px solid ${v('--color-border')};border-radius:var(--radius-lg,12px);background:${v('--color-surface-raised')};color:${v('--color-foreground')};box-shadow:var(--shadow-lg,0 18px 50px color-mix(in srgb,${v('--color-foreground')} 22%,transparent))}
[part~=toolbar]{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:end;gap:var(--spacing-sm,8px)}
[part~=swatch-preview]{position:relative;overflow:hidden;background:conic-gradient(${v('--color-separator')} 25%,${v('--color-surface')} 0 50%,${v('--color-separator')} 0 75%,${v('--color-surface')} 0) 0 0/8px 8px}
[part~=swatch-color]{position:absolute;inset:0;background:var(--cb-swatch-color)}
[part~=hex-field],[part~=channel-field]{display:grid;gap:2px;min-inline-size:0}
[part~=channel-label]{color:${v('--color-muted-foreground')};font-size:10px;font-weight:600;letter-spacing:.04em}
[part~=hex-input],[part~=channel-input]{inline-size:100%;min-inline-size:0;min-block-size:32px;padding:4px 8px;border:1px solid ${v('--color-border')};border-radius:var(--radius-sm);background:${v('--color-surface-muted')};font-variant-numeric:tabular-nums}
[part~=plane]{position:relative;inline-size:100%;block-size:var(--component-color-picker-plane-height,184px);min-block-size:144px;padding:0;overflow:hidden;border:1px solid ${v('--color-border')};border-radius:var(--radius-md);background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,var(--cb-hue-color));cursor:crosshair;touch-action:none}
button[part~=plane]:hover:not(:disabled),button[part~=plane]:active:not(:disabled){background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,var(--cb-hue-color))}
[part~=marker]{position:absolute;inset-block-start:calc(var(--cb-value-position) - 8px);inset-inline-start:calc(var(--cb-saturation-position) - 8px);inline-size:16px;block-size:16px;border:2px solid #fff;border-radius:50%;background:transparent;box-shadow:0 0 0 1px #000,0 1px 4px rgba(0,0,0,.5);pointer-events:none}
[part~=slider-field]{display:block;min-inline-size:0}
[part~=slider]{appearance:none;inline-size:100%;block-size:14px;min-block-size:14px;padding:0;border:1px solid ${v('--color-border')};border-radius:999px;background:transparent;cursor:pointer}
[part~=hue-slider]{background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)}
[part~=alpha-slider]{background:linear-gradient(90deg,transparent,var(--cb-solid-color)),conic-gradient(${v('--color-separator')} 25%,${v('--color-surface')} 0 50%,${v('--color-separator')} 0 75%,${v('--color-surface')} 0) 0 0/8px 8px}
[part~=slider]::-webkit-slider-thumb{appearance:none;inline-size:18px;block-size:18px;border:2px solid #fff;border-radius:50%;background:${v('--color-surface')};box-shadow:0 0 0 1px color-mix(in srgb,${v('--color-foreground')} 65%,transparent),0 1px 3px rgba(0,0,0,.35)}
[part~=slider]::-moz-range-thumb{inline-size:16px;block-size:16px;border:2px solid #fff;border-radius:50%;background:${v('--color-surface')};box-shadow:0 0 0 1px color-mix(in srgb,${v('--color-foreground')} 65%,transparent)}
[part~=channels]{display:grid;gap:var(--spacing-sm,8px)}
[part~=hsv-channels]{grid-template-columns:repeat(4,minmax(0,1fr))}
[part~=rgb-channels]{grid-template-columns:repeat(3,minmax(0,1fr))}
[part~=palette-group]{display:grid;gap:var(--spacing-xs,4px)}
[part~=palette]{display:flex;flex-wrap:wrap;gap:var(--spacing-xs,4px)}
[part~=swatch]{position:relative;inline-size:28px;min-inline-size:28px;block-size:28px;min-block-size:28px;padding:2px;border:1px solid ${v('--color-border')};border-radius:var(--radius-sm);background:${v('--color-surface')};overflow:hidden}
[part~=swatch][aria-pressed=true]{border-color:${v('--color-primary')};box-shadow:0 0 0 1px ${v('--color-primary')}}
[part~=swatch-preview]{display:block;inline-size:100%;block-size:100%;border-radius:calc(var(--radius-sm) - 2px)}
[part~=add-swatch]::part(control){border-style:dashed}
:host([data-invalid]) [part~=trigger],:host([data-invalid]) [part~=native]{border-color:${v('--color-danger')}}
@container(max-width:300px){[part~=hsv-channels]{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(pointer:coarse){[part~=trigger],[part~=native]{--component-color-picker-trigger-size:44px}[part~=swatch]{inline-size:36px;min-inline-size:36px;block-size:36px;min-block-size:36px}[part~=add-swatch]{--component-control-height-sm:36px}}
`

type ChannelName = 'hue' | 'saturation' | 'value' | 'alpha' | 'red' | 'green' | 'blue'

interface ColorSamplerResult { readonly sRGBHex: string }
interface ColorSampler { open(): Promise<ColorSamplerResult> }
interface ColorSamplerConstructor { new(): ColorSampler }
type ColorSamplerWindow = Window & { EyeDropper?: ColorSamplerConstructor }

interface ChannelDefinition {
    readonly name: ChannelName
    readonly min: number
    readonly max: number
    readonly step: number
}

const channels: readonly ChannelDefinition[] = [
    { name: 'hue', min: 0, max: 360, step: 1 }, { name: 'saturation', min: 0, max: 100, step: 1 },
    { name: 'value', min: 0, max: 100, step: 1 }, { name: 'alpha', min: 0, max: 100, step: 1 },
    { name: 'red', min: 0, max: 255, step: 1 }, { name: 'green', min: 0, max: 255, step: 1 },
    { name: 'blue', min: 0, max: 255, step: 1 },
]

export class ColorPicker extends ColorPickerBase {
    private trigger?: HTMLButtonElement
    private triggerSwatch?: HTMLElement
    private nativeControl?: HTMLInputElement
    private popup?: HTMLElement
    private plane?: HTMLButtonElement
    private hueSlider?: HTMLInputElement
    private alphaSlider?: HTMLInputElement
    private hexInput?: HTMLInputElement
    private hexLabelNode?: HTMLElement
    private paletteNode?: HTMLElement
    private paletteGroup?: HTMLElement
    private paletteLabel?: HTMLElement
    private samplerButton?: IconButton
    private closeButton?: IconButton
    private addSwatchButton?: IconButton
    private popupController?: PopupController
    private readonly channelInputs = new Map<ChannelName, HTMLInputElement>()
    private readonly channelLabels = new Map<ChannelName, HTMLElement>()
    private readonly swatchButtons = new Map<string, HTMLButtonElement>()

    render(): Node {
        const root = el('div', 'root')
        this.trigger = el('button', 'trigger control'); this.trigger.type = 'button'; this.trigger.id = uid('cb-color-picker')
        this.triggerSwatch = el('span', 'trigger-swatch'); this.trigger.append(this.triggerSwatch)
        this.nativeControl = el('input', 'native control'); this.nativeControl.type = 'color'; this.nativeControl.id = `${this.trigger.id}-native`
        this.popup = el('section', 'popup'); this.popup.id = `${this.trigger.id}-popup`; this.popup.setAttribute('role', 'dialog'); this.popup.tabIndex = -1; this.popup.hidden = true
        const toolbar = el('div', 'toolbar')
        const hexField = el('label', 'hex-field'), hexLabel = el('span', 'channel-label'); this.hexLabelNode = hexLabel
        this.hexInput = el('input', 'hex-input control'); this.hexInput.type = 'text'; this.hexInput.autocomplete = 'off'; this.hexInput.spellcheck = false
        hexField.append(hexLabel, this.hexInput)
        this.samplerButton = createIconButton('sampler', 'eye', event => { void this.sample(event) })
        this.closeButton = createIconButton('close', 'close', event => { if (this.setOpen(false, event)) this.trigger?.focus() })
        toolbar.append(hexField, this.samplerButton, this.closeButton)
        this.plane = el('button', 'plane'); this.plane.type = 'button'; this.plane.append(el('span', 'marker'))
        const hueField = this.sliderField('hue'), alphaField = this.sliderField('alpha')
        this.hueSlider = hueField.input
        this.alphaSlider = alphaField.input
        const hsvChannels = el('div', 'channels hsv-channels'), rgbChannels = el('div', 'channels rgb-channels')
        for (const definition of channels) {
            const wrapper = el('label', `channel-field ${definition.name}-field`), label = el('span', 'channel-label'), input = el('input', `channel-input ${definition.name}-input control`)
            input.type = 'number'; input.min = String(definition.min); input.max = String(definition.max); input.step = String(definition.step); input.inputMode = 'decimal'
            input.addEventListener('input', event => this.updateFromChannel(definition.name, input.valueAsNumber, false, event))
            input.addEventListener('change', event => this.updateFromChannel(definition.name, input.valueAsNumber, true, event))
            wrapper.append(label, input)
            const target = definition.name === 'red' || definition.name === 'green' || definition.name === 'blue' ? rgbChannels : hsvChannels
            target.append(wrapper)
            this.channelInputs.set(definition.name, input); this.channelLabels.set(definition.name, label)
        }
        this.addSwatchButton = createIconButton('add-swatch', 'plus', event => {
            const value = this.normalizedValue()
            if (this.addSwatch(value, event)) this.focusSwatch(value)
        })
        this.addSwatchButton.variant = 'outline'
        this.addSwatchButton.addEventListener('pointerdown', event => event.preventDefault())
        this.paletteGroup = el('div', 'palette-group'); this.paletteLabel = el('span', 'palette-label label'); this.paletteNode = el('div', 'palette'); this.paletteNode.append(this.addSwatchButton); this.paletteGroup.append(this.paletteLabel, this.paletteNode)
        this.popup.append(this.plane, hueField.field, alphaField.field, toolbar, hsvChannels, rgbChannels, this.paletteGroup)
        this.trigger.addEventListener('click', event => this.setOpen(!bool(this.open), event))
        this.plane.addEventListener('pointerdown', event => { this.plane?.setPointerCapture(event.pointerId); this.updateFromPlane(event, false) })
        this.plane.addEventListener('pointermove', event => { if (this.plane?.hasPointerCapture(event.pointerId)) this.updateFromPlane(event, false) })
        this.plane.addEventListener('pointerup', event => { this.plane?.releasePointerCapture(event.pointerId); this.updateFromPlane(event, true) })
        this.plane.addEventListener('keydown', event => this.handlePlaneKey(event))
        this.hueSlider.addEventListener('input', event => this.updateHue(false, event)); this.hueSlider.addEventListener('change', event => this.updateHue(true, event))
        this.alphaSlider.addEventListener('input', event => this.updateAlpha(false, event)); this.alphaSlider.addEventListener('change', event => this.updateAlpha(true, event))
        this.hexInput.addEventListener('input', event => this.updateFromHex(false, event)); this.hexInput.addEventListener('change', event => this.updateFromHex(true, event))
        this.nativeControl.addEventListener('input', event => { const color = parseHexColor(this.nativeControl?.value ?? ''); if (color) this.inputColor(color, event) })
        this.nativeControl.addEventListener('change', event => { const color = parseHexColor(this.nativeControl?.value ?? ''); if (color) this.changeColor(color, event) })
        this.nativeControl.addEventListener('blur', () => { this.validationShown = true; this.syncView() })
        root.append(this.trigger, this.nativeControl, this.popup)
        return fragment(sheet(css), root)
    }

    protected mount(): void {
        if (this.popup && this.trigger) this.popupController = new PopupController(this.popup, this.trigger, () => this.setOpen(false), {
            maxWidth: () => this.popupMaxWidth,
            maxHeight: () => this.popupMaxHeight,
        })
        super.mount()
    }

    protected unmount(): void { this.popupController?.dispose(); this.popupController = undefined }
    protected fieldElement(): HTMLInputElement | undefined { return this.nativeControl }

    protected syncView(): void {
        if (!this.trigger || !this.triggerSwatch || !this.nativeControl || !this.popup || !this.plane || !this.hueSlider || !this.alphaSlider || !this.hexInput || !this.paletteNode || !this.paletteGroup || !this.paletteLabel || !this.samplerButton || !this.closeButton || !this.addSwatchButton) return
        const color = this.color(), rgba = hsvaToRgba(color), value = colorToHex(color), solid = colorToHex({ ...color, alpha: 1 }, false), native = bool(this.native)
        this.value = value
        this.style.setProperty('--cb-selected-color', value); this.popup.style.setProperty('--cb-hue-color', `hsl(${color.hue}, 100%, 50%)`); this.popup.style.setProperty('--cb-solid-color', solid)
        this.popup.style.setProperty('--cb-saturation-position', `${color.saturation}%`); this.popup.style.setProperty('--cb-value-position', `${100 - color.value}%`)
        this.hueSlider.value = String(Math.round(color.hue)); this.alphaSlider.value = String(Math.round(color.alpha * 100))
        this.setEditorValue(this.hexInput, value)
        this.setChannelValues(color, rgba)
        this.syncLabels()
        this.syncPalette(value)
        this.nativeControl.value = colorToHex(color, false); this.nativeControl.disabled = this.unavailable || bool(this.readOnly); this.nativeControl.required = bool(this.required) && !bool(this.readOnly)
        this.nativeControl.setAttribute('aria-label', this.accessibleName())
        this.trigger.disabled = this.unavailable || bool(this.readOnly); this.trigger.hidden = native; this.nativeControl.hidden = !native
        this.trigger.setAttribute('aria-label', this.accessibleName()); this.trigger.setAttribute('aria-haspopup', 'dialog'); this.trigger.setAttribute('aria-controls', this.popup.id); aria(this.trigger, 'aria-expanded', bool(this.open) && !native)
        this.popup.setAttribute('aria-label', this.accessibleName())
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText)))
        const description = [text(this.description), error ? this.validationMessage : ''].filter(Boolean).join(' ') || null
        aria(this.trigger, 'aria-description', description); aria(this.nativeControl, 'aria-description', description)
        aria(this.trigger, 'aria-invalid', error ? true : null); aria(this.nativeControl, 'aria-invalid', error ? true : null)
        this.toggleAttribute('data-invalid', error); this.toggleAttribute('data-native', native)
        if (native) { this.open = false; this.removeAttribute('open'); this.popupController?.hide() }
        else if (bool(this.open)) this.popupController?.show(); else this.popupController?.hide()
        this.syncForm(value)
    }

    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options) }

    private sliderField(name: 'hue' | 'alpha'): { readonly field: HTMLElement; readonly input: HTMLInputElement } {
        const field = el('div', `slider-field ${name}-slider-field`), input = el('input', `slider ${name}-slider control`)
        input.type = 'range'; input.min = '0'; input.max = name === 'hue' ? '360' : '100'; input.step = '1'; field.append(input)
        return { field, input }
    }

    private syncLabels(): void {
        const labels: Readonly<Record<ChannelName, string>> = {
            hue: this.hueLabel, saturation: this.saturationLabel, value: this.valueLabel, alpha: this.alphaLabel,
            red: this.redLabel, green: this.greenLabel, blue: this.blueLabel,
        }
        for (const [name, label] of this.channelLabels) label.textContent = labels[name]
        if (this.hexLabelNode) this.hexLabelNode.textContent = this.hexLabel
        if (this.plane) this.plane.setAttribute('aria-label', this.planeLabel || this.accessibleName())
        if (this.hueSlider) this.hueSlider.setAttribute('aria-label', this.hueLabel)
        if (this.alphaSlider) this.alphaSlider.setAttribute('aria-label', this.alphaLabel)
        if (this.hexInput) this.hexInput.setAttribute('aria-label', this.hexLabel)
        for (const [name, input] of this.channelInputs) input.setAttribute('aria-label', labels[name])
        actionLabel(this.samplerButton!, this.samplerLabel); this.samplerButton!.hidden = !bool(this.allowSampler) || !this.samplerLabel || !this.samplerAvailable()
        actionLabel(this.closeButton!, this.closeLabel); this.closeButton!.hidden = !this.closeLabel
        actionLabel(this.addSwatchButton!, this.addSwatchLabel); this.addSwatchButton!.hidden = !this.addSwatchLabel
        this.addSwatchButton!.disabled = this.unavailable || bool(this.readOnly)
        this.paletteLabel!.textContent = this.swatchesLabel; this.paletteLabel!.hidden = !this.swatchesLabel
        this.alphaSlider!.closest<HTMLElement>('[part~=slider-field]')!.hidden = !bool(this.allowAlpha)
        this.channelInputs.get('alpha')!.closest<HTMLElement>('[part~=channel-field]')!.hidden = !bool(this.allowAlpha)
    }

    private setChannelValues(color: HSVAColor, rgba: RGBAColor): void {
        const values: Readonly<Record<ChannelName, number>> = {
            hue: Math.round(color.hue), saturation: Math.round(color.saturation), value: Math.round(color.value), alpha: Math.round(color.alpha * 100),
            red: rgba.red, green: rgba.green, blue: rgba.blue,
        }
        for (const [name, input] of this.channelInputs) this.setEditorValue(input, String(values[name]))
    }

    private setEditorValue(input: HTMLInputElement, value: string): void { if (this.activeNode() !== input) input.value = value }

    private updateFromPlane(event: PointerEvent, commit: boolean): void {
        if (!this.plane) return
        const bounds = this.plane.getBoundingClientRect()
        const saturation = clamp((event.clientX - bounds.left) / Math.max(1, bounds.width) * 100, 0, 100)
        const value = 100 - clamp((event.clientY - bounds.top) / Math.max(1, bounds.height) * 100, 0, 100)
        const next = { ...this.color(), saturation, value }
        if (commit) this.changeColor(next, event); else this.inputColor(next, event)
    }

    private handlePlaneKey(event: KeyboardEvent): void {
        const amount = event.shiftKey ? 10 : 1, color = this.color()
        let next: HSVAColor | null = null
        if (event.key === 'ArrowLeft') next = { ...color, saturation: clamp(color.saturation - amount, 0, 100) }
        else if (event.key === 'ArrowRight') next = { ...color, saturation: clamp(color.saturation + amount, 0, 100) }
        else if (event.key === 'ArrowUp') next = { ...color, value: clamp(color.value + amount, 0, 100) }
        else if (event.key === 'ArrowDown') next = { ...color, value: clamp(color.value - amount, 0, 100) }
        if (next) { event.preventDefault(); this.changeColor(next, event) }
    }

    private updateHue(commit: boolean, event: Event): void {
        const next = { ...this.color(), hue: clamp(finite(this.hueSlider?.valueAsNumber), 0, 360) }
        if (commit) this.changeColor(next, event); else this.inputColor(next, event)
    }

    private updateAlpha(commit: boolean, event: Event): void {
        const next = { ...this.color(), alpha: clamp(finite(this.alphaSlider?.valueAsNumber), 0, 100) / 100 }
        if (commit) this.changeColor(next, event); else this.inputColor(next, event)
    }

    private updateFromHex(commit: boolean, event: Event): void {
        const color = parseHexColor(this.hexInput?.value ?? '')
        if (!color) return
        if (commit) this.changeColor(color, event); else this.inputColor(color, event)
    }

    private updateFromChannel(name: ChannelName, source: number, commit: boolean, event: Event): void {
        if (!Number.isFinite(source)) return
        const color = this.color(), rgba = hsvaToRgba(color)
        let next: HSVAColor
        if (name === 'hue') next = { ...color, hue: clamp(source, 0, 360) }
        else if (name === 'saturation') next = { ...color, saturation: clamp(source, 0, 100) }
        else if (name === 'value') next = { ...color, value: clamp(source, 0, 100) }
        else if (name === 'alpha') next = { ...color, alpha: clamp(source, 0, 100) / 100 }
        else next = rgbaToHsva({ ...rgba, [name]: clamp(source, 0, 255) })
        if (commit) this.changeColor(next, event); else this.inputColor(next, event)
    }

    private syncPalette(selected: string): void {
        if (!this.paletteNode || !this.paletteGroup || !this.addSwatchButton) return
        const palette = this.palette()
        const colors = [...(bool(this.allowAlpha) ? ['#00000000'] : []), ...palette].filter((color, index, list) => list.indexOf(color) === index)
        const removableColors = new Set(palette.filter(color => color !== '#00000000'))
        const retained = new Set(colors)
        for (const [color, button] of this.swatchButtons) {
            if (retained.has(color)) continue
            button.remove()
            this.swatchButtons.delete(color)
        }
        let reference = this.paletteNode.firstElementChild
        for (const color of colors) {
            const label = color === '#00000000' ? this.transparentLabel || color : color
            let button = this.swatchButtons.get(color)
            if (!button) {
                button = this.createSwatchButton(color)
                this.swatchButtons.set(color, button)
            }
            button.setAttribute('aria-pressed', String(color === selected))
            button.disabled = this.unavailable || bool(this.readOnly)
            button.toggleAttribute('data-removable', removableColors.has(color))
            button.setAttribute('aria-label', this.swatchesLabel ? `${this.swatchesLabel}: ${label}` : label); button.title = label
            aria(button, 'aria-keyshortcuts', removableColors.has(color) ? 'Delete Backspace' : null)
            aria(button, 'aria-description', removableColors.has(color) && this.removeSwatchLabel ? this.removeSwatchLabel.replaceAll('{color}', label) : null)
            if (button !== reference) this.paletteNode.insertBefore(button, reference)
            reference = button.nextElementSibling
        }
        if (this.addSwatchButton.parentElement !== this.paletteNode) this.paletteNode.append(this.addSwatchButton)
        this.paletteGroup.hidden = colors.length === 0 && this.addSwatchButton.hidden
        this.paletteNode.setAttribute('role', 'group')
        aria(this.paletteNode, 'aria-label', this.swatchesLabel || null)
    }

    private createSwatchButton(color: string): HTMLButtonElement {
        const button = el('button', 'swatch'); button.type = 'button'; button.dataset.color = color
        const preview = el('span', 'swatch-preview'), fill = el('span', 'swatch-color'); fill.style.setProperty('--cb-swatch-color', color); preview.append(fill); button.append(preview)
        button.addEventListener('click', event => { if (this.choose(color, event)) this.focusSwatch(color) })
        button.addEventListener('keydown', event => {
            if (event.key !== 'Delete' && event.key !== 'Backspace') return
            if (!button.hasAttribute('data-removable')) return
            const index = Array.from(this.paletteNode?.querySelectorAll<HTMLButtonElement>('[part~=swatch]') ?? []).indexOf(button)
            if (!this.removeSwatch(color, event)) return
            event.preventDefault()
            this.focusPaletteItem(Math.max(0, index))
        })
        return button
    }

    private focusSwatch(color: string): void {
        const normalized = colorToHex(parseHexColor(color) ?? this.color())
        Array.from(this.paletteNode?.querySelectorAll<HTMLButtonElement>('[part~=swatch]') ?? [])
            .find(button => button.dataset.color === normalized)?.focus()
    }

    private focusPaletteItem(index: number): void {
        const buttons = Array.from(this.paletteNode?.querySelectorAll<HTMLButtonElement>('[part~=swatch]') ?? [])
        const button = buttons[Math.min(index, Math.max(0, buttons.length - 1))]
        if (button) button.focus(); else if (!this.addSwatchButton?.hidden) this.addSwatchButton?.focus()
    }

    private samplerAvailable(): boolean { return typeof (this.ownerDocument.defaultView as ColorSamplerWindow | null)?.EyeDropper === 'function' }

    private async sample(originalEvent: Event): Promise<void> {
        const Sampler = (this.ownerDocument.defaultView as ColorSamplerWindow | null)?.EyeDropper
        if (!Sampler || !bool(this.allowSampler)) return
        try {
            const result = await new Sampler().open()
            this.choose(result.sRGBHex, originalEvent)
        } catch {
            // The browser rejects when the user cancels; cancellation is not a component error.
        }
    }
}

register('cb-color-picker', ColorPicker)
export { ColorPickerBase }
export type { ColorPickerChangeDetail, ColorPickerProps, ColorPickerSwatchDetail } from './ColorPickerBase.js'
export { colorToHex, hsvaToRgba, normalizeColor, parseHexColor, rgbaToHsva } from './color.js'
export type { HSVAColor, RGBAColor } from './color.js'
