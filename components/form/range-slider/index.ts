import { register } from '../../core/Component.js'
import { html, when, type Template } from '../../core/runtime.js'
import { bool, scalarText } from '../../core/value.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { normalizeRange } from '../model.js'
import { RangeSliderBase, type RangeSliderThumb } from './RangeSliderBase.js'
import componentStylesheet from './styles.css?inline'

export class RangeSlider extends RangeSliderBase {
    stylesheet = componentStylesheet
    private view?: StudioView

    render(): Template {
        this.view = createStudioView(this)
        const single = this.view.root.onMount(({ refs }) => {
            const control = refs.control?.[0]
            if (!(control instanceof HTMLInputElement)) return
            // Native range inputs normalize while attributes are installed.
            // Restore the intended scalar after min, max, and step are in place.
            const { min, max, step } = this
            control.value = String(
                normalizeRange({ min, max, step, value: Number(this.value) })
                    .value
            )
        })
        return html`${when(this.isDouble, this.renderDouble, single)}`
    }

    protected fieldElement(): HTMLInputElement | undefined {
        const node = this.isDouble()
            ? this.thumbElement('start')
            : this.view?.control
        return node instanceof HTMLInputElement ? node : undefined
    }

    protected syncView(): void {
        this.view?.update()
    }

    private thumbElement(
        thumb: RangeSliderThumb
    ): HTMLInputElement | undefined {
        const node = this.refs[thumb]?.[0]
        return node instanceof HTMLInputElement ? node : undefined
    }

    private endpoint = (thumb: RangeSliderThumb): number =>
        this.rangeValue[thumb === 'start' ? 0 : 1]

    private thumbLabel(thumb: RangeSliderThumb): string {
        const custom = scalarText(
            thumb === 'start' ? this.startLabel : this.endLabel
        )
        const edge = thumb === 'start' ? 'Minimum' : 'Maximum'
        return (
            custom || [this.accessibleName(), edge].filter(Boolean).join(': ')
        )
    }

    private thumbInput = (thumb: RangeSliderThumb, event: Event): void => {
        event.stopPropagation()
        const control = event.currentTarget
        if (control instanceof HTMLInputElement) {
            this.setEndpoint(thumb, control.valueAsNumber, event)
            // Native thumb moves before input fires. Restore it after a veto or an attempted crossing.
            control.value = String(this.endpoint(thumb))
        }
    }

    private chooseFromTrack = (event: PointerEvent): void => {
        const track = event.currentTarget
        if (
            !(track instanceof HTMLElement) ||
            event.target instanceof HTMLInputElement ||
            event.button !== 0 ||
            !this.canChangeValue()
        )
            return
        const rail = this.refs.rail?.[0]
        if (!rail) return
        const { left, right, width } = rail.getBoundingClientRect()
        if (width <= 0) return
        const { min, max } = this.rangeBounds
        const rtl = getComputedStyle(track).direction === 'rtl'
        const fraction = Math.min(
            1,
            Math.max(
                0,
                (rtl ? right - event.clientX : event.clientX - left) / width
            )
        )
        const value = min + (max - min) * fraction
        const [start, end] = this.rangeValue
        const thumb =
            start === end
                ? value < start
                    ? 'start'
                    : 'end'
                : Math.abs(start - value) < Math.abs(end - value)
                  ? 'start'
                  : 'end'
        event.preventDefault()
        this.setEndpoint(thumb, value, event)
        this.thumbElement(thumb)?.focus()
    }

    private renderThumb = (thumb: RangeSliderThumb): Template => {
        const invalid = () =>
            Boolean(this.errorText) || this.hasAttribute('data-field-invalid')
        return html`<input
            ref="${thumb}"
            type="range"
            part="${thumb === 'start' ? 'control start-thumb' : 'control end-thumb'}"
            min="${() => this.rangeBounds.min}"
            max="${() => this.rangeBounds.max}"
            step="${() => this.rangeBounds.step}"
            value="${() => this.endpoint(thumb)}"
            disabled="${this.controlUnavailable}"
            aria-label="${() => this.thumbLabel(thumb)}"
            aria-valuemin="${() => (thumb === 'start' ? this.rangeBounds.min : this.endpoint('start'))}"
            aria-valuemax="${() => (thumb === 'start' ? this.endpoint('end') : this.rangeBounds.max)}"
            aria-readonly="${() => (bool(this.readOnly) ? 'true' : null)}"
            aria-invalid="${() => (invalid() ? 'true' : null)}"
            aria-description="${() => [scalarText(this.description), scalarText(this.errorText)].filter(Boolean).join(' ') || null}"
            oninput="${(event: Event) => this.thumbInput(thumb, event)}"
        />`
    }

    private renderDouble = (): Template => {
        const trackStyle = (): string => {
            const { min, max } = this.rangeBounds
            const [start, end] = this.rangeValue
            const percent = (value: number) =>
                max === min ? 0 : ((value - min) * 100) / (max - min)
            return `--cb-range-start:${percent(start)}%;--cb-range-end:${percent(end)}%`
        }
        return html`<div part="root" data-component="range-slider">
            <div part="body">
                <div
                    part="range-track"
                    data-read-only="${() => (bool(this.readOnly) ? 'true' : null)}"
                    style="${trackStyle}"
                    onpointerdown="${this.chooseFromTrack}"
                >
                    <span ref="rail" part="range-rail" aria-hidden="true"
                        ><span part="range-fill"></span
                    ></span>
                    ${this.renderThumb('start')}${this.renderThumb('end')}
                </div>
            </div>
        </div>`
    }
}

export { RangeSliderBase }
export type {
    RangeSliderProps,
    RangeSliderValue,
    RangeSliderVariant,
    RangeSliderThumb,
    RangeSliderChangeDetail,
} from './RangeSliderBase.js'

register('cb-range-slider', RangeSlider)
