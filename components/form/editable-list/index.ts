import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import {
    is,
    isNot,
    or,
    pick,
    type Template,
    html,
    repeat,
    when,
    state,
} from '../../core/runtime.js'
import { bool, scalarText } from '../../core/value.js'
import { EditableListBase, type EditableListItem } from './EditableListBase.js'

export class EditableList extends EditableListBase {
    stylesheet = componentStylesheet

    private readonly editing = state('')
    private readonly draft = state('')
    private readonly addition = state('')
    private pendingRemovalFocus?: { id: string; index: number }

    render(): Template {
        return html`<div
            part="editor"
            role="group"
            aria-label=${this.accessibleName}
            aria-description=${() =>
                [this.description, this.helpText, this.validationError()]
                    .filter(Boolean)
                    .join(' ')}
            aria-invalid=${() => Boolean(this.validationError()) || null}
            aria-busy=${() => bool(this.loading) || null}
        >
            <ul part="list">
                ${repeat(
                    this.normalizedItems,
                    (item, index) =>
                        html`<li part="item" data-id=${item.id}>
                            ${when(
                                () =>
                                    !bool(this.controlled) &&
                                    this.editing[0]() === item.id,
                                () => this.editItem(item),
                                () => this.displayItem(item, index)
                            )}
                        </li>`,
                    { key: (item) => item.id }
                )}
                ${when(
                    isNot(pick(this.normalizedItems, 'length')),
                    () =>
                        html`<li part="empty" role="status">
                            ${this.props.emptyLabel}
                        </li>`
                )}
            </ul>
            ${when(
                () => bool(this.loading),
                () =>
                    html`<cb-spinner
                        part="loading"
                        accessible-label=${this.accessibleName}
                    ></cb-spinner>`
            )}
            ${when(
                () => !bool(this.readOnly),
                () =>
                    html`<slot name="entry">${this.addRow()}</slot
                        ><slot name="suggestions"></slot>`
            )}
            ${when(
                () => Boolean(this.helpText),
                () => html`<span part="help">${this.props.helpText}</span>`
            )}
            ${when(
                () => Boolean(this.validationError()),
                () =>
                    html`<span part="error" role="alert"
                        >${() => this.validationError()}</span
                    >`
            )}
        </div>`
    }

    private editItem(item: EditableListItem): Template {
        return html`
            <cb-text-input
                part="edit-input"
                ref="edit"
                accessible-label=${() =>
                    scalarText(this.inputLabel) || this.accessibleName()}
                value=${this.draft[0]}
                disabled=${or(() => this.actionUnavailable(), item.disabled)}
                onchange=${(event: CustomEvent<{ value: string }>) => {
                    event.stopPropagation()
                    this.draft[1](event.detail.value)
                }}
                onkeydown=${(event: KeyboardEvent) => {
                    if (event.key === 'Enter') {
                        event.preventDefault()
                        this.commitDraft(item, event)
                    } else if (event.key === 'Escape') {
                        event.preventDefault()
                        this.editing[1]('')
                    }
                }}
            ></cb-text-input>
            <div part="edit-actions">
                <cb-button
                    part="save"
                    exportparts="control:save-control,label:save-label,button-label:save-label,icon:save-icon,description:save-description"
                    label=${this.props.saveLabel}
                    onaction=${(event: Event) => {
                        event.stopPropagation()
                        this.commitDraft(item, event)
                    }}
                ></cb-button>
                <cb-button
                    part="cancel"
                    exportparts="control:cancel-control,label:cancel-label,button-label:cancel-label,icon:cancel-icon,description:cancel-description"
                    label=${this.props.cancelLabel}
                    onaction=${(event: Event) => {
                        event.stopPropagation()
                        this.editing[1]('')
                    }}
                ></cb-button>
            </div>
        `
    }

    private displayItem(item: EditableListItem, index: number): Template {
        const removeDisabled = or(
            () => this.actionUnavailable(),
            () => this.disabledItem(item),
            () => item.removable === false,
            () => bool(item.removing),
            () => this.normalizedItems().length <= this.minimumItems()
        )
        return html`
            ${when(
                () => Boolean(item.icon),
                () =>
                    html`<cb-icon part="item-icon" name=${item.icon}></cb-icon>`
            )}
            <slot name=${`item-content-${item.id}`}>
                <span part="item-copy">
                    <span part="item-label">${item.label}</span>
                    <span part="item-description" hidden=${!item.description}
                        >${item.description}</span
                    >
                </span>
            </slot>
            <slot name=${`item-actions-${item.id}`}></slot>
            <div part="item-actions">
                ${when(
                    () => !bool(this.controlled),
                    () => html`
                        ${this.itemAction(
                            item,
                            'edit',
                            'text',
                            this.props.editLabel,
                            () => this.disabledItem(item),
                            (event) => {
                                this.draft[1](item.label)
                                this.editing[1](item.id)
                                event.stopPropagation()
                                queueMicrotask(() => {
                                    const input = this.refs.edit?.[0]
                                    if (input instanceof HTMLElement)
                                        input.focus()
                                })
                            }
                        )}
                        ${this.itemAction(
                            item,
                            'move-up',
                            'up',
                            this.props.moveUpLabel,
                            or(
                                () => this.disabledItem(item),
                                isNot(this.props.allowReorder),
                                is(() => index, 0)
                            ),
                            (event) => this.moveItem(item.id, -1, event)
                        )}
                        ${this.itemAction(
                            item,
                            'move-down',
                            'down',
                            this.props.moveDownLabel,
                            or(
                                () => this.disabledItem(item),
                                isNot(this.props.allowReorder),
                                is(
                                    () => this.normalizedItems().length - 1,
                                    index
                                )
                            ),
                            (event) => this.moveItem(item.id, 1, event)
                        )}
                    `
                )}
                ${when(
                    () => item.removable === false,
                    () =>
                        html`<cb-icon
                            part="locked"
                            name="lock"
                            accessible-label=${this.props.lockedLabel}
                        ></cb-icon>`,
                    () =>
                        html`<cb-button
                            ref="remove"
                            part="remove"
                            icon-only
                            icon="close"
                            variant="ghost"
                            size="xs"
                            loading=${item.removing}
                            disabled=${removeDisabled}
                            accessible-label=${() =>
                                scalarText(item.removeLabel) ||
                                scalarText(this.removeLabel).replaceAll(
                                    '{item}',
                                    item.label
                                )}
                            onaction=${(event: Event) => {
                                event.stopPropagation()
                                this.rememberRemovalFocus(item.id, index)
                                this.removeItem(item.id, event)
                            }}
                        ></cb-button>`
                )}
            </div>
        `
    }

    private addRow(): Template {
        return html`<div part="add-row">
            <cb-text-input
                part="add-input"
                ref="add"
                accessible-label=${() =>
                    scalarText(this.inputLabel) || this.accessibleName()}
                placeholder=${this.props.placeholder}
                type=${this.props.inputType}
                autocomplete=${this.props.autocomplete}
                value=${() =>
                    bool(this.props.controlled?.())
                        ? scalarText(this.props.draftValue?.())
                        : this.addition[0]()}
                disabled=${this.addDisabled}
                onchange=${(event: CustomEvent<{ value: string }>) => {
                    event.stopPropagation()
                    if (bool(this.controlled)) {
                        this.emit('input', {
                            value: event.detail.value,
                            originalEvent: event,
                        })
                    } else {
                        this.addition[1](event.detail.value)
                    }
                }}
                onkeydown=${(event: KeyboardEvent) => {
                    if (event.key === 'Enter' && !event.isComposing) {
                        event.preventDefault()
                        this.addDraft(event)
                    }
                }}
            ></cb-text-input>
            <slot name="entry-extra"></slot>
            <cb-button
                part="add"
                exportparts="control:add-control,label:add-label,button-label:add-label,icon:add-icon,description:add-description"
                icon="plus"
                label=${this.props.addLabel}
                loading=${this.props.adding}
                disabled=${or(this.addDisabled, this.blankDraft)}
                onaction=${(event: Event) => {
                    event.stopPropagation()
                    this.addDraft(event)
                }}
            ></cb-button>
        </div>`
    }

    private validationError(): string {
        return this.validationShown
            ? this.validationMessage
            : scalarText(this.errorText)
    }
    private currentDraft = (): string =>
        bool(this.controlled) ? scalarText(this.draftValue) : this.addition[0]()
    private blankDraft = (): boolean => !this.currentDraft().trim()
    private addDisabled = (): boolean =>
        this.actionUnavailable() ||
        this.normalizedItems().length >= this.maximumItems()
    private disabledItem(item: EditableListItem): boolean {
        return this.actionUnavailable() || item.disabled === true
    }
    private itemAction(
        item: EditableListItem,
        part: string,
        icon: string,
        label: (() => string | undefined) | undefined,
        disabled: () => boolean,
        handler: (event: Event) => void
    ): Template {
        return html`<cb-button
            part=${part}
            icon-only
            icon=${icon}
            variant="ghost"
            size="xs"
            disabled=${disabled}
            accessible-label=${() =>
                scalarText(label?.()).replaceAll('{item}', item.label)}
            onaction=${(event: Event) => {
                event.stopPropagation()
                handler(event)
            }}
        ></cb-button>`
    }
    private commitDraft(item: EditableListItem, event: Event): void {
        if (this.updateItem(item.id, this.draft[0](), event))
            this.editing[1]('')
    }
    private addDraft(event: Event): void {
        if (this.addItem(this.currentDraft(), event) && !bool(this.controlled))
            this.addition[1]('')
    }
    private rememberRemovalFocus(id: string, index: number): void {
        if (!bool(this.controlled)) return
        this.pendingRemovalFocus = { id, index }
    }
    private restoreRemovalFocus(): void {
        const pending = this.pendingRemovalFocus
        if (
            !pending ||
            this.normalizedItems().some((item) => item.id === pending.id)
        )
            return
        this.pendingRemovalFocus = undefined
        queueMicrotask(() => {
            if (!this.isConnected) return
            const buttons = this.refs.remove ?? []
            const next = buttons[Math.min(pending.index, buttons.length - 1)]
            if (next instanceof HTMLElement) next.focus()
            else this.focus()
        })
    }
    protected syncView(): void {
        this.syncListForm()
        this.dataset.variant = this.variant === 'chips' ? 'chips' : 'rows'
        this.toggleAttribute('data-invalid', Boolean(this.validationError()))
        const add = this.refs.add?.[0]
        if (
            bool(this.controlled) &&
            add instanceof HTMLElement &&
            'value' in add
        ) {
            const control = add as HTMLElement & { value: string }
            const value = scalarText(this.draftValue)
            if (control.value !== value) control.value = value
        }
        this.restoreRemovalFocus()
    }
    focus(options?: FocusOptions): void {
        const node = this.refs.add?.[0]
        if (node instanceof HTMLElement) node.focus(options)
        else super.focus(options)
    }
}

export { EditableListBase }
export type {
    EditableListProps,
    EditableListItem,
    EditableListChangeReason,
} from './EditableListBase.js'

register('cb-editable-list', EditableList)
