import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { is, or, isNot, pick, type Template, html, repeat, when, state } from '../../core/runtime.js'

import { bool, scalarText } from '../../core/value.js';
import { EditableListBase, type EditableListItem } from './EditableListBase.js';

export class EditableList extends EditableListBase {
    stylesheet = componentStylesheet

    private readonly editing = state('');
    private readonly draft = state('');
    private readonly addition = state('');
    render(): Template {
        return html`<div part="editor" role="group" aria-label=${this.accessibleName}
            aria-description=${() => [this.description,this.validationError()].filter(Boolean).join(' ')} aria-invalid=${() => Boolean(this.validationError()) || null}>
            <ul part="list">${repeat(this.normalizedItems, (item,index) => html`<li part="item" data-id=${item.id}>
                ${when(is(this.editing[0], item.id), () => html`
                    <cb-text-input part="edit-input" ref="edit" accessible-label=${this.props.inputLabel} value=${this.draft[0]}
                        disabled=${or(() => this.unavailable, item.disabled)}
                        onchange=${(event: CustomEvent<{ value: string }>) => { event.stopPropagation(); this.draft[1](event.detail.value); }}
                        onkeydown=${(event: KeyboardEvent) => {
                            if(event.key === 'Enter') { event.preventDefault(); this.commitDraft(item,event); }
                            else if(event.key === 'Escape') { event.preventDefault(); this.editing[1](''); }
                        }}></cb-text-input>
                    <div part="edit-actions"><cb-button part="save" exportparts="control:save-control,label:save-label,button-label:save-label,icon:save-icon,description:save-description" label=${this.props.saveLabel}
                        onaction=${(event: Event) => { event.stopPropagation(); this.commitDraft(item,event); }}></cb-button>
                        <cb-button part="cancel" exportparts="control:cancel-control,label:cancel-label,button-label:cancel-label,icon:cancel-icon,description:cancel-description" label=${this.props.cancelLabel} onaction=${(event: Event) => { event.stopPropagation(); this.editing[1](''); }}></cb-button></div>
                `, () => html`<span part="item-copy"><span part="item-label">${item.label}</span>
                    <span part="item-description" hidden=${!item.description}>${item.description}</span></span>
                    <div part="item-actions">
                        ${this.itemAction(item,'edit','text',this.props.editLabel,() => this.disabledItem(item),event => {
                            this.draft[1](item.label); this.editing[1](item.id); event.stopPropagation();
                            queueMicrotask(() => { const input=this.refs.edit?.[0]; if(input instanceof HTMLElement) input.focus(); });
                        })}
                        ${this.itemAction(item,'move-up','up',this.props.moveUpLabel,or(() => this.disabledItem(item), isNot(this.props.allowReorder), is(() => index, 0)),event => this.moveItem(item.id,-1,event))}
                        ${this.itemAction(item,'move-down','down',this.props.moveDownLabel,or(() => this.disabledItem(item), isNot(this.props.allowReorder), is(() => this.normalizedItems().length-1, index)),event => this.moveItem(item.id,1,event))}
                        ${this.itemAction(item,'remove','close',this.props.removeLabel,or(() => this.disabledItem(item), () => this.normalizedItems().length <= this.minimumItems()),event => this.removeItem(item.id,event))}
                    </div>`)}
            </li>`,{key:item => item.id})}
            ${when(isNot(pick(this.normalizedItems, "length")), () => html`<li part="empty" role="status">${this.props.emptyLabel}</li>`)}</ul>
            <div part="add-row"><cb-text-input part="add-input" ref="add" accessible-label=${this.props.inputLabel} placeholder=${this.props.placeholder}
                value=${this.addition[0]} disabled=${this.addDisabled}
                onchange=${(event: CustomEvent<{ value: string }>) => { event.stopPropagation(); this.addition[1](event.detail.value); }}
                onkeydown=${(event: KeyboardEvent) => { if(event.key === 'Enter') { event.preventDefault(); this.addDraft(event); } }}></cb-text-input>
                <cb-button part="add" exportparts="control:add-control,label:add-label,button-label:add-label,icon:add-icon,description:add-description" label=${this.props.addLabel} disabled=${this.addDisabled}
                    onaction=${(event: Event) => { event.stopPropagation(); this.addDraft(event); }}></cb-button>
            </div></div>`;
    }
    private validationError(): string { return this.validationShown ? this.validationMessage : scalarText(this.errorText); }
    private addDisabled = or(() => this.unavailable, () => this.readOnly, () => this.normalizedItems().length >= this.maximumItems());
    private disabledItem(item: EditableListItem): boolean { return this.unavailable || bool(this.readOnly) || item.disabled === true; }
    private itemAction(item: EditableListItem, part: string, icon: string, label: (() => string | undefined) | undefined, disabled: () => boolean, handler: (event: Event) => void): Template {
        return html`<cb-button part=${part} icon-only icon=${icon} variant="ghost" size="xs" disabled=${disabled}
            accessible-label=${() => scalarText(label?.()).replaceAll('{item}',item.label)}
            onaction=${(event: Event) => { event.stopPropagation(); handler(event); }}></cb-button>`;
    }
    private commitDraft(item: EditableListItem,event: Event): void { if(this.updateItem(item.id,this.draft[0](),event)) this.editing[1](''); }
    private addDraft(event: Event): void { if(this.addItem(this.addition[0](),event)) this.addition[1](''); }
    protected syncView(): void { this.syncListForm(); this.toggleAttribute('data-invalid',Boolean(this.validationError())); }
    focus(options?: FocusOptions): void { const node=this.refs.add?.[0]; if(node instanceof HTMLElement) node.focus(options); }
}
export { EditableListBase };
export type { EditableListProps, EditableListItem, EditableListChangeReason } from './EditableListBase.js';

register('cb-editable-list', EditableList)
