import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { when, isNot, is, or, html, repeat, type Template } from '../../core/runtime.js'

import { uid } from '../../core/id.js';
import { bool, scalarText } from '../../core/value.js';

import { AccordionBase, type AccordionContent, type AccordionItem } from './AccordionBase.js';

export class Accordion extends AccordionBase {
    stylesheet = componentStylesheet

    private readonly instanceId = uid('cb-accordion');
    private readonly lazyContent = new WeakMap<AccordionItem, Template | Node>();
    private rendered(item: AccordionItem, index: number, actions = false): AccordionContent {
        try {
            if (actions) return item.renderActions?.({ accordion: this, item, index }) ?? '';
            if (item.renderItem) {
                if (!this.lazyContent.has(item) && this.itemExpanded(item.id)) this.lazyContent.set(item, item.renderItem());
                return this.lazyContent.get(item) ?? '';
            }
            return (item.renderContent ? item.renderContent({ accordion: this, item, index }) : item.content) ?? '';
        }
        catch (error) { this.onError(error); return null; }
    }
    render(): Template {
        const id = (item: AccordionItem, suffix: string): string => `${this.instanceId}-${item.id}-${suffix}`;
        return html`<div part="root" data-variant=${this.resolvedVariant}
            role=${() => this.accessibleLabel || this.label ? 'group' : null}
            aria-label=${() => this.accessibleLabel || this.label || null}
            aria-describedby=${() => this.description ? `${this.instanceId}-description` : null}>
            <p part="group-description description" id=${`${this.instanceId}-description`} hidden=${isNot(this.props.description)}>${this.props.description}</p>
            ${repeat(this.itemList, (item, index) => html`<section part="item"
                data-expanded=${() => this.itemExpanded(item.id) ? '' : null} data-disabled=${() => this.itemDisabled(item) ? '' : null}>
                <div part="header"><div part="heading" role="heading" aria-level=${this.resolvedHeadingLevel} aria-label=${() => item.label || item.id}>
                    <cb-button ref="triggers" part="trigger" exportparts="control:trigger-control,label:trigger-label,button-label:trigger-label,icon:trigger-icon,description:trigger-description" data-bare data-semantic-host id=${id(item,'trigger')} data-accordion-id=${item.id}
                        disabled=${() => this.itemDisabled(item)} accessible-label=${() => [item.label || item.id,item.description].filter(Boolean).join(' ')}
                        aria-controls=${id(item,'panel')} aria-expanded=${when(() => this.itemExpanded(item.id), 'true', 'false')}
                        aria-disabled=${() => this.itemDisabled(item) || null}
                        aria-describedby=${() => this.itemDisabled(item) && item.disabledReason ? id(item,'reason') : null}
                        onaction=${(event: Event) => { event.stopPropagation(); this.toggle(item.id,event); }}
                        onkeydown=${(event: KeyboardEvent) => this.handleKey(item.id,event)}>
                        <span part="trigger-content"><span part="label">${() => item.label || item.id}</span>
                            <span part="description" hidden=${isNot(item.description)}>${() => item.description ?? ''}</span></span>
                        <cb-icon name="right" part="indicator icon" decorative></cb-icon>
                    </cb-button>
                </div><div part="actions">
                    ${repeat(() => (item.actions ?? []).filter(action => action.id?.trim() && action.label?.trim()), action => html`
                        <cb-button part="action" exportparts="control:action-control,label:action-label,button-label:action-label,icon:action-icon,description:action-description" icon-only=${or(action.icon, action.iconSrc)} icon=${() => action.icon ?? ''} icon-src=${action.iconSrc}
                            label=${() => action.label} accessible-label=${() => action.label}
                            disabled=${or(() => bool(action.disabled), () => this.itemDisabled(item))} variant=${() => action.variant ?? 'ghost'}
                            onaction=${(event: Event) => { event.stopPropagation(); this.emit('itemaction',{item,id:item.id,action,actionId:action.id,originalEvent:event}); }}></cb-button>
                    `, {key: action => action.id})}
                    ${() => this.rendered(item,index,true)}<slot name=${`actions-${item.id}`} part="actions-slot"></slot>
                </div></div>
                <div part="panel" id=${id(item,'panel')} role="region" aria-labelledby=${id(item,'trigger')}
                    aria-hidden=${isNot(() => this.itemExpanded(item.id))} inert=${() => !this.itemExpanded(item.id) ? '' : null}>
                    <div part="panel-content"><div part="panel-inner"><slot part="content" name=${() => scalarText(item.slot).trim() || `item-${item.id}`}>
                        ${() => this.rendered(item,index)}</slot></div></div>
                </div>
                <div part="disabled-reason" id=${id(item,'reason')} hidden=${or(isNot(() => this.itemDisabled(item)), isNot(item.disabledReason))}>${() => this.itemDisabled(item) ? item.disabledReason : ''}</div>
            </section>`, {key: item => item.id})}
            <div part="empty" role="status" hidden=${or(() => this.itemList().length > 0, isNot(this.props.emptyLabel))}>${this.props.emptyLabel}</div>
        </div>`;
    }
    private handleKey(id: string, event: KeyboardEvent): void {
        const items = this.itemList().filter(item => !this.itemDisabled(item)), index = items.findIndex(item => item.id === id);
        const next = event.key === 'ArrowDown' ? (index + 1) % items.length
            : event.key === 'ArrowUp' ? (index - 1 + items.length) % items.length
            : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : -1;
        if (next < 0 || !items[next]) return;
        event.preventDefault(); this.focusItem(items[next].id);
    }
    protected syncView(): void {
        this.dataset.variant = this.resolvedVariant();
        this.toggleAttribute('data-animated', bool(this.animated,true));
    }
}
export { AccordionBase };
export type { AccordionAction, AccordionBulkExpansionDetail, AccordionContent, AccordionExpansionChangeDetail, AccordionExpansionDetail, AccordionItem, AccordionItemContext, AccordionProps, AccordionVariant, } from './AccordionBase.js';

register('cb-accordion', Accordion)
