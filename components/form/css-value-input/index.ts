import { register } from '../../core/Component.js'
import { html, when, repeat, or, type Template } from '../../core/runtime.js'
import { PopupController } from '../../core/popup.js'
import { bool } from '../../core/value.js'
import { uid } from '../../core/id.js'
import { CssValueInputBase } from './CssValueInputBase.js'
import type { CssValueInputDetail } from './CssValueInputBase.js'
import componentStylesheet from './styles.css?inline'

export class CssValueInput extends CssValueInputBase {
    stylesheet = componentStylesheet
    private readonly controlId = uid('cb-css-value')
    private controller?: PopupController
    private get input(): HTMLInputElement | undefined { const node = this.refs.input?.[0]; return node instanceof HTMLInputElement ? node : undefined }
    private get popup(): HTMLElement | undefined { const node = this.refs.popup?.[0]; return node instanceof HTMLElement ? node : undefined }
    protected fieldElement(): HTMLInputElement | undefined { return this.input }
    protected mount(): void {
        const anchor = this.refs.shell?.[0]
        if (this.popup && anchor instanceof HTMLElement) {
            this.controller = new PopupController(this.popup, anchor, event => {
                this.setOpen(false, event)
                if (event instanceof KeyboardEvent && event.key === 'Escape') this.input?.focus()
            }, { placement: () => 'bottom-start', matchAnchorWidth: true, maxHeight: () => '240px' })
            this.cleanup(() => this.controller?.dispose())
        }
        this.listen(this.contentRoot, 'focusin', this.focusIn)
        this.listen(this.contentRoot, 'focusout', this.focusOut)
        super.mount()
    }
    protected syncView(): void {
        if (bool(this.open) && this.filteredSuggestions().length) this.controller?.show()
        else this.controller?.hide()
    }
    private contain = (event: Event): void => { event.stopPropagation() }
    private handleInput = (event: Event): void => {
        event.stopPropagation()
        if (!this.input) return
        this.editText(this.input.value, event)
        this.setOpen(!this.functionValue(), event)
    }
    private choose = (value: string, event: Event): void => {
        event.stopPropagation()
        this.editText(value, event)
        this.setOpen(false, event)
        this.input?.focus()
    }
    private handleKey = (event: KeyboardEvent): void => {
        if (event.isComposing || event.defaultPrevented || event.ctrlKey || event.metaKey || !this.canChangeValue()) return
        if (event.key === 'Escape') { event.preventDefault(); this.setOpen(false, event); this.input?.focus() }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (this.numericValue()) {
                this.stepNumeric(event.key === 'ArrowUp' ? 1 : -1, event)
                return
            }
            this.setOpen(true, event)
            const options = (this.refs.options || []).filter((node): node is HTMLElement => node instanceof HTMLElement && !node.hasAttribute('disabled'))
            const current = options.findIndex(node => node === this.activeNode()), direction = event.key === 'ArrowDown' ? 1 : -1
            options[current < 0 ? direction > 0 ? 0 : options.length - 1 : (current + direction + options.length) % options.length]?.focus()
        }
    }
    private focusIn = (): void => { this.focused[1](true) }
    private focusOut = (event: Event): void => {
        if (event instanceof FocusEvent && event.relatedTarget instanceof Node && (this.contains(event.relatedTarget) || this.contentRoot.contains(event.relatedTarget))) return
        this.focused[1](false)
    }
    private argumentName = (index: number): string => this.argumentLabel.replaceAll('{index}', String(index + 1))
    render(): Template {
        return html`<div ref="shell" part="control" data-function="${() => this.functionValue()?.name || null}">
            <div part="value">
                <input ref="input" part="input" type="text" value="${this.displayValue}" placeholder="${this.props.placeholder}"
                    role="combobox" aria-label="${this.accessibleName}" aria-autocomplete="list" aria-controls="${this.controlId}"
                    aria-expanded="${() => bool(this.open) && this.filteredSuggestions().length > 0 ? 'true' : 'false'}"
                    aria-invalid="${() => !this.validDraft() ? 'true' : null}" aria-description="${this.props.errorText}"
                    pattern="${() => this.validDraft() ? null : '(?!)'}"
                    required="${this.props.required}" disabled="${this.controlUnavailable}" readonly="${this.props.readOnly}"
                    oninput="${this.handleInput}" onkeydown="${this.handleKey}">
                ${when(this.numericValue, html`<cb-select part="unit" accessible-label="${this.props.unitLabel}" size="${this.props.size}"
                    options="${this.unitOptions}" value="${this.selectedUnit}" searchable="false" disabled="${or(this.controlUnavailable, this.props.readOnly)}"
                    onbeforechange="${this.contain}" onchange="${(event: CustomEvent<{ value: string }>) => { event.stopPropagation(); this.chooseUnit(event.detail.value, event) }}"></cb-select>`,
                    html`<cb-button part="toggle" icon="down" icon-only="true" variant="ghost" size="${this.props.size}" accessible-label="${this.accessibleName}"
                        disabled="${or(this.controlUnavailable, this.props.readOnly)}" aria-haspopup="listbox" aria-expanded="${this.props.open}"
                        onbeforeaction="${this.contain}" onaction="${(event: Event) => { event.stopPropagation(); this.setOpen(!bool(this.open), event); this.input?.focus() }}"></cb-button>`)}
            </div>
            ${when(this.functionValue, html`<div part="arguments">
                ${repeat(() => this.functionValue()?.arguments.map((value, index) => index) || [], index => html`<cb-css-value-input part="argument" expand-functions="false"
                    accessible-label="${() => this.argumentName(index)}" argument-label="${() => `${this.argumentName(index)} · {index}`}"
                    unit-label="${() => `${this.argumentName(index)} ${this.unitLabel}`}" size="${this.props.size}"
                    step="${this.props.step}"
                    value="${() => this.functionValue()?.arguments[index] || ''}" units="${this.props.units}" default-unit="${this.props.defaultUnit}"
                    css-property="${this.props.cssProperty}" suggestions="${() => this.suggestions.filter(option => /^(min|max|clamp|calc|var)\(/u.test(typeof option === 'string' ? option : option.value || ''))}"
                    disabled="${this.controlUnavailable}" read-only="${this.props.readOnly}" onbeforechange="${this.contain}" onchange="${this.contain}"
                    onopen="${(event: CustomEvent<{ open: boolean }>) => { event.stopPropagation(); this.setOpen(false, event) }}" onclose="${this.contain}"
                    oninput="${(event: CustomEvent<CssValueInputDetail>) => { event.stopPropagation(); this.editArgument(index, event.detail.value, event) }}"></cb-css-value-input>`, { key: index => index })}
            </div>`)}
        </div>
        <div ref="popup" part="popup" hidden role="listbox" id="${this.controlId}" aria-label="${this.accessibleName}" onkeydown="${this.handleKey}">
            ${repeat(this.filteredSuggestions, option => html`<cb-button ref="options" part="option" data-bare data-semantic-host role="option"
                aria-selected="${() => this.draft[0]() === option.value ? 'true' : 'false'}" disabled="${option.disabled}" accessible-label="${option.label}"
                onbeforeaction="${this.contain}" onaction="${(event: Event) => this.choose(option.value, event)}">${option.label}</cb-button>`, { key: option => option.value })}
        </div>`
    }
}
export { CssValueInputBase }
export type { CssValueInputProps, CssValueSuggestion, CssValueInputDetail } from './CssValueInputBase.js'
register('cb-css-value-input', CssValueInput)
