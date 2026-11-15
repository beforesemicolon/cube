import { register } from '../../core/Component.js'
import { html, repeat, when, type Template } from '../../core/runtime.js'
import { elementRefs } from '../../core/refs.js'
import componentStylesheet from './styles.css?inline'
import { ColorSwatchBase, type ColorSwatchOption } from './ColorSwatchBase.js'

export class ColorSwatch extends ColorSwatchBase {
    stylesheet = componentStylesheet
    private controls = (): HTMLElement[] => elementRefs(this.refs.controls)
    private tabStop = (): string | undefined => {
        const options = this.normalizedOptions.filter(option => !option.disabled)
        return (options.find(option => option.value === this.displayColor()) ?? options[0])?.value
    }
    private swatch(option?: ColorSwatchOption): Template {
        const color = () => option?.value ?? this.displayColor()
        const selected = () => option ? option.value === this.displayColor() : this.isSelected()
        const disabled = () => this.unavailable || Boolean(option?.disabled)
        return html`<cb-button ref="controls" part="control" data-bare data-semantic-host
            role=${option ? 'radio' : 'button'} data-color=${color} data-shape=${this.props.variant}
            tabindex=${() => disabled() || (option && option.value !== this.tabStop()) ? -1 : 0}
            exportparts="control:button" variant="ghost" size=${this.props.size}
            accessible-label=${() => option?.label ?? this.swatchLabel()} disabled=${disabled}
            aria-pressed=${() => option ? null : String(selected())}
            aria-checked=${() => option ? String(selected()) : null}
            aria-disabled=${() => disabled() ? 'true' : null}
            aria-keyshortcuts=${() => this.getAttribute('aria-keyshortcuts')}
            aria-description=${() => this.getAttribute('aria-description')}
            onbeforeaction=${(event: Event) => event.stopPropagation()}
            onaction=${(event: Event) => {
                event.stopPropagation()
                if (option) this.choose(option.value, event)
                else this.activate(event)
            }}>
            <span part="preview" data-variant=${this.props.variant} data-selected=${() => selected() ? '' : null}>
                <span part="color" style=${() => `background:${color()}`}></span>
            </span>
        </cb-button>`
    }
    private navigate = (event: KeyboardEvent): void => {
        if (event.altKey || event.ctrlKey || event.metaKey || this.unavailable) return
        const controls = this.controls().filter(control => !control.hasAttribute('disabled'))
        if (!controls.length) return
        const current = controls.findIndex(control => event.composedPath().includes(control))
        const rtl = getComputedStyle(this).direction === 'rtl'
        let next: number
        if (event.key === 'Home') next = 0
        else if (event.key === 'End') next = controls.length - 1
        else if (event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) next = (current + 1) % controls.length
        else if (event.key === 'ArrowUp' || event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) next = (current - 1 + controls.length) % controls.length
        else return
        event.preventDefault()
        const control = controls[next]
        this.choose(control.dataset.color ?? '', event)
        control.focus()
    }
    render(): Template {
        return html`${when(this.hasOptions,
            () => html`<div part="palette" role="radiogroup" aria-label=${() => this.accessibleName() || 'Color options'}
                onkeydown=${this.navigate}>
                ${repeat(() => this.normalizedOptions, option => this.swatch(option), { key: option => option.value })}
            </div>`,
            () => this.swatch()
        )}`
    }
    protected syncView(): void { this.toggleAttribute('data-palette', this.hasOptions()) }
    focus(options?: FocusOptions): void {
        const controls = this.controls()
        ;(controls.find(control => control.tabIndex === 0) ?? controls.find(control => !control.hasAttribute('disabled')))?.focus(options)
    }
}
export { ColorSwatchBase }
export type { ColorSwatchProps, ColorSwatchVariant, ColorSwatchOption } from './ColorSwatchBase.js'

register('cb-color-swatch', ColorSwatch)
