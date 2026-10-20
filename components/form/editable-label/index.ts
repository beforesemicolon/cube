import componentStylesheet from './styles.css?inline'
import { or, isNot, html, type Template } from '../../core/runtime.js'

import { bool, scalarText } from '../../core/value.js'
import { EditableLabelBase } from './EditableLabelBase.js'

export class EditableLabel extends EditableLabelBase {
    stylesheet = componentStylesheet

    private get input(): HTMLInputElement | undefined { const node = this.refs.input?.[0]; return node instanceof HTMLInputElement ? node : undefined }
    protected fieldElement(): HTMLInputElement | undefined { return this.input }
    render(): Template {
        const error = () => this.validationShown ? this.validationMessage : scalarText(this.errorText)
        return html`<span part="root">
            <cb-button part="display" exportparts="control:display-control,label:display-label,button-label:display-label,icon:display-icon,description:display-description" data-bare data-semantic-host hidden="${this.props.editing}"
                label="${this.displayValue}" data-empty="${() => !scalarText(this.value) ? '' : null}"
                accessible-label="${() => scalarText(this.editLabel).replaceAll('{value}', scalarText(this.value)) || this.accessibleName()}"
                disabled="${or(() => this.unavailable, this.props.readOnly)}"
                onbeforeaction="${(event: Event) => event.stopPropagation()}"
                onaction="${(event: Event) => { event.stopPropagation(); this.startEditing(event) }}"
                onkeydown="${(event: KeyboardEvent) => { if (event.key === 'F2') { event.preventDefault(); this.startEditing(event) } }}"></cb-button>
            <span ref="editor" part="editor" hidden="${isNot(this.props.editing)}"
                onblur="${[(event: FocusEvent) => {
                    const editor = event.currentTarget
                    if (!bool(this.submitOnBlur) || editor instanceof Node && event.relatedTarget instanceof Node && editor.contains(event.relatedTarget)) return
                    queueMicrotask(() => { if (bool(this.editing)) this.commitEditing(this.input?.value) })
                }, true]}">
                <input ref="input" part="input" type="text" value="${() => bool(this.editing) ? this.draft : scalarText(this.value)}"
                    placeholder="${this.props.placeholder}" disabled="${() => this.unavailable}" readonly="${this.props.readOnly}" required="${this.props.required}"
                    aria-label="${() => this.accessibleName() || scalarText(this.editLabel)}"
                    oninput="${(event: Event) => { const input = event.currentTarget; if (input instanceof HTMLInputElement && !this.changeDraft(input.value, event)) input.value = this.draft }}"
                    onkeydown="${(event: KeyboardEvent) => { if (event.key === 'Enter') { event.preventDefault(); this.commitEditing(this.input?.value, event) } else if (event.key === 'Escape') { event.preventDefault(); this.cancelEditing(event) } }}">
                <cb-button part="save" exportparts="control:save-control,label:save-label,button-label:save-label,icon:save-icon,description:save-description" variant="ghost" icon="check" icon-only="true" accessible-label="${this.props.saveLabel}" disabled="${or(() => this.unavailable, this.props.readOnly)}"
                    onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.commitEditing(this.input?.value, event) }}"></cb-button>
                <cb-button part="cancel" exportparts="control:cancel-control,label:cancel-label,button-label:cancel-label,icon:cancel-icon,description:cancel-description" variant="ghost" icon="close" icon-only="true" accessible-label="${this.props.cancelLabel}" disabled="${() => this.unavailable}"
                    onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.cancelEditing(event) }}"></cb-button>
            </span>
            <span part="error" role="alert" hidden="${isNot(error)}">${error}</span>
        </span>`
    }
    protected syncView(): void {
        this.toggleAttribute('data-editing', bool(this.editing))
        if (bool(this.editing)) queueMicrotask(() => {
            const input = this.input
            if (!input || this.activeNode() === input) return
            input.focus()
            if (bool(this.selectOnEdit)) input.select()
        })
    }
}
export { EditableLabelBase };
export type { EditableLabelProps } from './EditableLabelBase.js';
