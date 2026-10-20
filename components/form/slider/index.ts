import componentStylesheet from './styles.css?inline'
import { html, type Template } from '../../core/runtime.js'

import { SliderBase } from './SliderBase.js'
import { bool, text } from '../../core/value.js'

export class Slider extends SliderBase {
    stylesheet = componentStylesheet

    render(): Template {
        const error = () => Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText)))
        return html`
            <input ref="control" part="control" type="range"
                min="${() => this.range.min}" max="${() => this.range.max}" step="${() => this.range.step}"
                value="${() => this.range.value}" disabled="${() => this.unavailable}" style="${() => '--cb-slider-fill:' + this.range.percent + '%'}"
                aria-label="${this.accessibleName}" aria-orientation="${() => bool(this.stacked) ? 'vertical' : 'horizontal'}"
                aria-valuetext="${() => text(this.valueText) || null}" aria-readonly="${() => bool(this.readOnly) ? 'true' : null}"
                aria-invalid="${() => error() ? 'true' : null}" aria-description="${() => [text(this.description), error() ? this.validationMessage : ''].filter(Boolean).join(' ') || null}"
                oninput="${(event: Event) => { const input = event.currentTarget; if (input instanceof HTMLInputElement && !this.setValue(input.valueAsNumber, event)) input.value = String(this.range.value) }}"
                onpointerdown="${() => { this.pointerActive = true }}" onblur="${() => { this.pointerActive = false }}">
            `
    }
    protected fieldElement(): HTMLInputElement | undefined {
        const node = this.refs.control?.[0]
        return node instanceof HTMLInputElement ? node : undefined
    }
    protected syncView(): void { this.toggleAttribute('data-stacked', bool(this.stacked)) }
}
export { SliderBase };
export type { SliderProps } from './SliderBase.js';
