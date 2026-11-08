import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { elementRefs } from '../../core/refs.js'
import {
    when,
    is,
    and,
    or,
    isNot,
    html,
    repeat,
    state,
    type Template,
} from '../../core/runtime.js'

import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js'
import { PopupController } from '../../core/popup.js'
import type { Button } from '../../action/button/index.js'
import { ComboboxBase } from './ComboboxBase.js'
import type { NormalizedSelectOption } from '../model.js'

export class Combobox extends ComboboxBase {
    stylesheet = componentStylesheet

    private readonly controlId = uid('cb-combobox')
    private popupController?: PopupController
    private get trigger(): HTMLElement | undefined {
        const node = this.refs.trigger?.[0]
        return node instanceof HTMLElement ? node : undefined
    }
    private get popup(): HTMLElement | undefined {
        const node = this.refs.popup?.[0]
        return node instanceof HTMLElement ? node : undefined
    }
    private readonly completion = state<{
        query: string
        label: string
    } | null>(null)
    private get input(): HTMLInputElement | undefined {
        const node = this.refs.input?.[0]
        return node instanceof HTMLInputElement ? node : undefined
    }
    private optionId = (value: string): string =>
        `${this.controlId}-option-${encodeURIComponent(value)}`
    private highlightedOption = (): NormalizedSelectOption | undefined => {
        if (!bool(this.open) || this.unavailable || bool(this.readOnly))
            return undefined
        const options = this.filteredOptions(),
            option = options[0]
        return options.length === 1 && !option?.disabled ? option : undefined
    }
    private activeOptionId = (): string | null => {
        const option = this.highlightedOption()
        return option ? this.optionId(option.value) : null
    }
    private selectedItems = (): Array<{ value: string; label: string }> => {
        return this.selection.map((value) => ({
            value,
            label:
                this.normalizedOptions.find((option) => option.value === value)
                    ?.selectedLabel ?? value,
        }))
    }
    private displayValue = (): string => {
        const completion = this.completion[0]()
        const query = this.queryValue()
        if (bool(this.multi) || (bool(this.searchable) && this.searching[0]()))
            return query
        return completion &&
            completion.query === query &&
            this.autocomplete === 'both'
            ? completion.label
            : (this.normalizedOptions.find(
                  (option) => option.value === this.singleValue()
              )?.label ?? this.singleValue())
    }
    private removalLabel = (label: string): string => {
        return text(this.removeLabel).replaceAll('{label}', label) || label
    }
    private validationError(): boolean {
        return (
            Boolean(text(this.props.errorText?.())) ||
            (Boolean(this.validationMessage) && this.validationShown)
        )
    }
    private descriptionText = (): string | null => {
        return (
            [
                text(this.props.description?.()),
                this.validationError()
                    ? text(this.props.errorText?.()) || this.validationMessage
                    : '',
            ]
                .filter(Boolean)
                .join(' ') || null
        )
    }
    render(): Template {
        return html`<div part="root">
            <div
                ref="trigger"
                part="input-shell control"
                data-variant="${this.props.variant}"
                data-caret-position="${this.props.caretPosition}"
                data-multi="${when(this.props.multi, '', null)}"
            >
                <div part="values" onclick="${this.openFromField}">
                    ${when(
                        this.props.multi,
                        repeat(
                            this.selectedItems,
                            (item) =>
                                html`<span
                                    part="selection"
                                    data-value="${item.value}"
                                >
                                    <span part="selection-label"
                                        >${item.label}</span
                                    >
                                    <cb-button
                                        part="remove"
                                        exportparts="control:remove-control,icon:remove-icon"
                                        size="tiny"
                                        variant="ghost"
                                        icon="close"
                                        icon-only="true"
                                        accessible-label="${() => this.removalLabel(item.label)}"
                                        disabled="${or(() => this.unavailable, this.props.readOnly)}"
                                        onbeforeaction="${this.containAction}"
                                        onaction="${(event: Event) => this.removeSelection(item.value, event)}"
                                    ></cb-button>
                                </span>`,
                            { key: (item) => item.value }
                        )
                    )}
                    <input
                        ref="input"
                        part="input"
                        type="text"
                        id="${this.controlId}"
                        value="${this.displayValue}"
                        placeholder="${when(
                            and(
                                this.props.multi,
                                is(
                                    () => this.selection,
                                    (values) => values.length > 0
                                )
                            ),
                            '',
                            this.props.placeholder
                        )}"
                        disabled="${() => this.unavailable}"
                        readonly="${this.props.readOnly}"
                        required="${and(this.props.required, isNot(this.props.multi))}"
                        aria-label="${this.accessibleName}"
                        role="combobox"
                        aria-autocomplete="${() => this.autocomplete ?? 'list'}"
                        aria-controls="${this.controlId}-listbox"
                        aria-expanded="${when(this.props.open, 'true', 'false')}"
                        aria-activedescendant="${this.activeOptionId}"
                        aria-invalid="${() => (this.validationError() ? 'true' : null)}"
                        aria-description="${this.descriptionText}"
                        oninput="${this.handleInput}"
                        onkeydown="${this.handleKey}"
                    />
                </div>
                <cb-button
                    part="toggle"
                    exportparts="control:toggle-control,label:toggle-label,button-label:toggle-label,icon:toggle-icon,description:toggle-description"
                    variant="ghost"
                    icon="${when(this.props.open, 'up', 'down')}"
                    icon-only="true"
                    accessible-label="${() => text(this.toggleLabel) || this.accessibleName()}"
                    disabled="${or(() => this.unavailable, this.props.readOnly)}"
                    aria-haspopup="listbox"
                    aria-controls="${this.controlId}-listbox"
                    aria-expanded="${when(this.props.open, 'true', 'false')}"
                    onbeforeaction="${this.containAction}"
                    onaction="${this.togglePopup}"
                ></cb-button>
            </div>
            <div
                ref="popup"
                part="popup listbox"
                hidden
                role="listbox"
                id="${this.controlId}-listbox"
                aria-label="${this.accessibleName}"
                aria-multiselectable="${when(this.props.multi, 'true', null)}"
                aria-busy="${when(this.props.loading, 'true', null)}"
                onkeydown="${this.handleKey}"
            >
                ${when(this.props.loading, () => html`<cb-spinner part="loading" accessible-label="${this.props.loadingLabel}"></cb-spinner>`)}
                ${repeat(
                    this.filteredOptions,
                    (option) =>
                        html`<cb-button
                            ref="options"
                            part="option"
                            exportparts="control:option-control,button-label:option-label"
                            data-bare
                            data-semantic-host
                            id="${this.optionId(option.value)}"
                            data-highlighted="${is(this.highlightedOption, (highlighted) => highlighted?.value === option.value)}"
                            data-value="${option.value}"
                            role="option"
                            accessible-label="${option.label}"
                            disabled="${or(option.disabled, () => this.unavailable)}"
                            aria-selected="${when(
                                is(
                                    () => this.selection,
                                    (values) => values.includes(option.value)
                                ),
                                'true',
                                'false'
                            )}"
                            onbeforeaction="${this.containAction}"
                            onaction="${(event: Event) => this.chooseOption(option.value, event)}"
                        >
                            ${when(option.icon, () => html`<cb-icon part="option-icon" name="${option.icon}"></cb-icon>`)}
                            <span part="option-copy"
                                ><span part="option-label">${option.label}</span
                                >${when(option.description, () => html`<span part="option-description">${option.description}</span>`)}</span
                            >
                            ${when(option.badge, () => html`<cb-badge part="option-badge" tone="neutral">${option.badge}</cb-badge>`)}
                            ${when(
                                is(
                                    () => this.selection,
                                    (values) => values.includes(option.value)
                                ),
                                html`<cb-icon
                                    part="check"
                                    name="check"
                                    decorative="true"
                                ></cb-icon>`
                            )}
                        </cb-button>`,
                    { key: (option) => option.value }
                )}

                <span
                    part="empty"
                    role="status"
                    hidden="${or(this.props.loading, () => this.filteredOptions().length > 0, isNot(this.props.emptyLabel))}"
                    >${this.props.emptyLabel}</span
                >
            </div>
        </div>`
    }
    protected mount(): void {
        if (this.popup && this.trigger) {
            this.popupController = new PopupController(
                this.popup,
                this.trigger,
                (event) => {
                    this.setOpen(false, event)
                    if (
                        event instanceof KeyboardEvent &&
                        event.key === 'Escape'
                    )
                        this.input?.focus()
                },
                {
                    placement: () => 'bottom-start',
                    matchAnchorWidth: true,
                    maxWidth: () => this.popupMaxWidth,
                    maxHeight: () => this.popupMaxHeight,
                }
            )
            this.cleanup(() => this.popupController?.dispose())
        }
        super.mount()
        this.syncPopup()
    }
    protected fieldElement(): HTMLInputElement | undefined {
        return this.input
    }
    protected syncView(): void {
        this.syncPopup()
    }
    private syncPopup(): void {
        if (!this.popup) return
        if (!bool(this.open)) this.popupController?.hide()
        else this.popupController?.show()
        if (!this.popupController) this.popup.hidden = !bool(this.open)
    }
    private handleInput = (event: Event): void => {
        const input = this.input
        if (!input) return
        if (this.unavailable || bool(this.readOnly)) {
            input.value = this.displayValue()
            return
        }
        const query = input.value
        this.searching[1](true)
        if (bool(this.multi) || bool(this.searchable)) this.query[1](query)
        else if (query !== this.singleValue() && !this.setValue(query, event)) {
            input.value = this.displayValue()
            return
        }
        if (bool(this.searchable))
            this.emit('search', { query, originalEvent: event })
        this.setOpen(true, event)
        const composing = event instanceof InputEvent && event.isComposing
        const match =
            !composing && this.autocomplete === 'both' && query
                ? this.normalizedOptions.find(
                      (option) =>
                          !option.disabled &&
                          option.label
                              .toLocaleLowerCase()
                              .startsWith(query.toLocaleLowerCase())
                  )
                : undefined
        this.completion[1](match ? { query, label: match.label } : null)
        if (match)
            queueMicrotask(() => {
                if (this.completion[0]()?.query !== query) return
                // Inline completion is a native editing operation: restore the
                // completed text as well as its selection when the label is unchanged.
                input.value = match.label
                input.setSelectionRange(query.length, match.label.length)
            })
    }
    private containAction = (event: Event): void => {
        event.stopPropagation()
    }
    private openFromField = (event: Event): void => {
        if (
            event
                .composedPath()
                .some(
                    (node) =>
                        node instanceof HTMLElement &&
                        node.localName === 'cb-button'
                )
        )
            return
        this.setOpen(true, event)
        this.input?.focus()
    }
    private togglePopup = (event: Event): void => {
        event.stopPropagation()
        this.setOpen(!bool(this.open), event)
        this.input?.focus()
    }
    private chooseOption = (value: string, event: Event): void => {
        event.stopPropagation()
        const changed = this.choose(value, event)
        if (bool(this.multi)) {
            if (changed) this.clearQuery()
        } else if (changed || value === this.singleValue())
            this.setOpen(false, event)
        this.input?.focus()
    }
    private clearQuery = (): void => {
        this.query[1]('')
        this.searching[1](false)
        this.completion[1](null)
    }
    private acceptOption = (value: string, event: Event): void => {
        // Keyboard acceptance adds an option; it must not toggle off a chip
        // that is already selected when the same label is typed again.
        if (bool(this.multi) && this.selection.includes(value))
            this.clearQuery()
        else this.chooseOption(value, event)
    }
    private removeSelection = (value: string, event: Event): void => {
        event.stopPropagation()
        if (this.removeValue(value, event)) this.input?.focus()
    }
    private handleKey = (event: KeyboardEvent): void => {
        // The popup's capture listener already handles Escape and focus.
        if (
            event.isComposing ||
            event.defaultPrevented ||
            this.unavailable ||
            bool(this.readOnly)
        )
            return
        if (
            this.activeNode() === this.input &&
            bool(this.open) &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey
        ) {
            const option = this.highlightedOption()
            if ((event.key === 'Enter' || event.key === ' ') && option) {
                event.preventDefault()
                this.acceptOption(option.value, event)
                return
            }
            if (
                event.key === 'Enter' &&
                bool(this.allowCustom) &&
                this.queryValue().trim() &&
                this.filteredOptions().length === 0
            ) {
                event.preventDefault()
                if (this.acceptCustomValue(event)) {
                    this.clearQuery()
                    if (!bool(this.multi)) this.setOpen(false, event)
                }
                return
            }
        }
        if (
            event.key === 'Backspace' &&
            bool(this.multi) &&
            this.activeNode() === this.input &&
            !this.query[0]()
        ) {
            const last = this.selection.at(-1)
            if (last && this.removeValue(last, event)) event.preventDefault()
            return
        }
        if (event.key === 'Escape') {
            event.preventDefault()
            this.setOpen(false, event)
            this.input?.focus()
            return
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (!this.open) this.setOpen(true, event)
            const options = elementRefs(this.refs.options).filter(
                (node) => !node.hasAttribute('disabled')
            )
            const active = this.activeNode()
            const current =
                active?.localName === 'cb-button'
                    ? options.indexOf(active as Button)
                    : -1
            const direction = event.key === 'ArrowDown' ? 1 : -1
            options[
                current < 0
                    ? direction > 0
                        ? 0
                        : options.length - 1
                    : (current + direction + options.length) % options.length
            ]?.focus()
        }
        const active = this.activeNode()
        if (event.key === 'Enter' && active?.localName === 'cb-button') {
            event.preventDefault()
            ;(active as Button).click()
        }
    }
}
export { ComboboxBase }
export type { ComboboxProps } from './ComboboxBase.js'

register('cb-combobox', Combobox)
