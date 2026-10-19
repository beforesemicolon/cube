import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { SliderBase } from './SliderBase.js'
import { bool, text } from '../../core/value.js'
const css = editorCSS + `
:host{display:block;inline-size:var(--component-slider-width,320px);max-inline-size:100%;min-inline-size:min(100%,var(--component-slider-min-width,160px))}
[part=control]{display:block;appearance:none;inline-size:100%;padding:0;border:0;background:transparent;cursor:pointer}
[part=control]::-webkit-slider-runnable-track{block-size:var(--component-slider-track-height,4px);border-radius:var(--radius-sm,6px);background:linear-gradient(to right,var(--color-primary,#2563EB) var(--cb-slider-fill,0%),var(--color-track,#D8DCDE) var(--cb-slider-fill,0%))}
[part=control]::-webkit-slider-thumb{appearance:none;inline-size:var(--component-slider-thumb-size,12px);block-size:var(--component-slider-thumb-size,12px);border-radius:50%;background:var(--color-surface,#fff);border:2px solid var(--color-primary,#2563EB);margin-block-start:calc((var(--component-slider-track-height,4px) - var(--component-slider-thumb-size,12px))/2)}
[part=control]::-moz-range-track{block-size:var(--component-slider-track-height,4px);border-radius:var(--radius-sm,6px);background:var(--color-track,#D8DCDE)}
[part=control]::-moz-range-progress{block-size:var(--component-slider-track-height,4px);background:var(--color-primary,#2563EB)}
[part=control]::-moz-range-thumb{inline-size:var(--component-slider-thumb-size,12px);block-size:var(--component-slider-thumb-size,12px);border-radius:50%;background:var(--color-surface,#fff);border:2px solid var(--color-primary,#2563EB)}
[part=control]:disabled{cursor:not-allowed;opacity:var(--component-disabled-opacity,.5)}
:host([data-stacked]){min-inline-size:var(--cb-height);inline-size:var(--cb-height)}
:host([data-stacked]) [part=control]{writing-mode:vertical-lr;direction:rtl;block-size:var(--cb-height);inline-size:160px}
`;
export class Slider extends SliderBase {
    render(): Template {
        const error = () => Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText)))
        return html`<style part="styles">${css}</style>
            <input ref="control" part="control" type="range"
                min="${() => this.range.min}" max="${() => this.range.max}" step="${() => this.range.step}"
                value="${() => this.range.value}" disabled="${() => this.unavailable}" style="${() => '--cb-slider-fill:' + this.range.percent + '%'}"
                aria-label="${() => this.accessibleName()}" aria-orientation="${() => bool(this.stacked) ? 'vertical' : 'horizontal'}"
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
