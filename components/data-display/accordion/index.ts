import { html, repeat, type Template } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { uid } from '../../core/id.js';
import { bool, scalarText } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import { AccordionBase, type AccordionContent, type AccordionItem } from './AccordionBase.js';
const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0}
[part~=root]{display:grid;inline-size:100%;min-inline-size:0}
[part~=group-description]{margin:0 0 var(--spacing-sm,8px);color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px)}
[part~=root][data-variant=simple] [part~=item]:first-of-type{border-block-start:1px solid var(--component-accordion-border,${v('--color-separator')})}
[part~=root][data-variant=container]{gap:var(--component-accordion-gap,var(--spacing-sm,8px))}
[part~=item]{min-inline-size:0;background:var(--component-accordion-background,${v('--color-surface')});border-block-end:1px solid var(--component-accordion-border,${v('--color-separator')})}
[part~=root][data-variant=container] [part~=item]{border:1px solid var(--component-accordion-border,${v('--color-separator')});border-radius:var(--component-accordion-radius,${v('--radius-sm')});overflow:clip}
[part~=item][data-expanded]{box-shadow:var(--component-accordion-expanded-shadow,none)}
[part~=header]{display:flex;align-items:stretch;min-inline-size:0;background:var(--component-accordion-trigger-background,${v('--color-surface-muted')})}
[part~=heading]{display:flex;flex:1;min-inline-size:0;margin:0}
[part~=trigger]{appearance:none;display:flex;inline-size:100%;min-inline-size:0;min-block-size:var(--component-accordion-trigger-height,36px);padding:0;border:0;border-radius:0;background:transparent;text-align:start;white-space:normal}
[part~=trigger]::part(control){display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-md,12px);inline-size:100%;min-block-size:100%;padding:var(--component-accordion-trigger-padding,var(--spacing-sm,8px) var(--spacing-md,12px));text-align:inherit;white-space:inherit}
[part~=trigger]::part(button-label){display:contents}
[part~=trigger]:hover:not(:disabled){background:var(--component-accordion-trigger-hover,${v('--color-active')})}
[part~=trigger]:focus-visible{position:relative;z-index:1;outline-offset:-2px}
[part~=trigger-content]{display:grid;min-inline-size:0;gap:2px}
[part~=label]{overflow:hidden;color:var(--component-accordion-label-color,${v('--color-foreground')});font-weight:500;text-overflow:ellipsis}
[part~=description]{color:var(--component-accordion-description-color,${v('--color-muted-foreground')});font-size:var(--component-caption-font-size,11px);font-weight:400}
[part~=indicator]{inline-size:14px;block-size:14px;transition:rotate var(--motion-duration-normal,160ms) ease-out}
[part~=item][data-expanded] [part~=indicator]{rotate:90deg}
[part~=actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px);padding-inline-end:var(--spacing-sm,8px)}
[part~=actions]:empty{display:none}
[part~=action]{--component-control-height:28px;align-self:center}
[part~=panel]{display:grid;grid-template-rows:0fr;visibility:hidden;opacity:0;transition:grid-template-rows var(--motion-duration-normal,160ms) ease-out,opacity var(--motion-duration-fast,100ms) ease-out,visibility 0s linear var(--motion-duration-normal,160ms)}
[part~=item][data-expanded] [part~=panel]{grid-template-rows:1fr;visibility:visible;opacity:1;transition-delay:0s}
[part~=panel-content]{min-block-size:0;overflow:hidden}
[part~=panel-inner]{padding:var(--component-accordion-content-padding,var(--spacing-md,12px));color:${v('--color-foreground')}}
[part~=disabled-reason]{padding:2px var(--spacing-md,12px) var(--spacing-xs,4px);color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px);background:${v('--color-surface')}}
[part~=empty]{padding:var(--spacing-md,12px);border:1px dashed ${v('--color-separator')};border-radius:${v('--radius-sm')};color:${v('--color-muted-foreground')}}
:host(:not([data-animated])) [part~=panel],:host(:not([data-animated])) [part~=indicator]{transition:none}
@media (prefers-reduced-motion:reduce){[part~=panel],[part~=indicator]{transition:none}}
`;
export class Accordion extends AccordionBase {
    private readonly instanceId = uid('cb-accordion');
    private rendered(item: AccordionItem, index: number, actions = false): AccordionContent {
        try { return (actions ? item.renderActions?.({ accordion: this, item, index }) : item.renderContent ? item.renderContent({ accordion: this, item, index }) : item.content) ?? ''; }
        catch (error) { this.onError(error); return null; }
    }
    render(): Template {
        const id = (item: AccordionItem, suffix: string): string => `${this.instanceId}-${item.id}-${suffix}`;
        return html`<style part="styles">${css}</style><div part="root" data-variant=${() => this.resolvedVariant()}
            role=${() => this.accessibleLabel || this.label ? 'group' : null}
            aria-label=${() => this.accessibleLabel || this.label || null}
            aria-describedby=${() => this.description ? `${this.instanceId}-description` : null}>
            <p part="group-description description" id=${`${this.instanceId}-description`} hidden=${() => !this.description}>${() => this.description}</p>
            ${repeat(() => this.itemList(), (item, index) => html`<section part="item"
                data-expanded=${() => this.itemExpanded(item.id) ? '' : null} data-disabled=${() => this.itemDisabled(item) ? '' : null}>
                <div part="header"><div part="heading" role="heading" aria-level=${() => this.resolvedHeadingLevel()} aria-label=${() => item.label || item.id}>
                    <cb-button part="trigger" exportparts="control:trigger-control,label:trigger-label,button-label:trigger-label,icon:trigger-icon,description:trigger-description" data-bare data-semantic-host id=${id(item,'trigger')} data-accordion-id=${item.id}
                        disabled=${() => this.itemDisabled(item)} accessible-label=${() => [item.label || item.id,item.description].filter(Boolean).join(' ')}
                        aria-controls=${id(item,'panel')} aria-expanded=${() => this.itemExpanded(item.id)}
                        aria-disabled=${() => this.itemDisabled(item) || null}
                        aria-describedby=${() => this.itemDisabled(item) && item.disabledReason ? id(item,'reason') : null}
                        onaction=${(event: Event) => { event.stopPropagation(); this.toggle(item.id,event); }}
                        onkeydown=${(event: KeyboardEvent) => this.handleKey(item.id,event)}>
                        <span part="trigger-content"><span part="label">${() => item.label || item.id}</span>
                            <span part="description" hidden=${() => !item.description}>${() => item.description}</span></span>
                        <cb-icon name="right" part="indicator icon" decorative></cb-icon>
                    </cb-button>
                </div><div part="actions">
                    ${repeat(() => (item.actions ?? []).filter(action => action.id?.trim() && action.label?.trim()), action => html`
                        <cb-button part="action" exportparts="control:action-control,label:action-label,button-label:action-label,icon:action-icon,description:action-description" icon-only=${() => Boolean(action.icon)} icon=${() => action.icon ?? ''}
                            label=${() => action.label} accessible-label=${() => action.label}
                            disabled=${() => bool(action.disabled) || this.itemDisabled(item)} variant=${() => action.variant ?? 'ghost'}
                            onaction=${(event: Event) => { event.stopPropagation(); this.emit('itemaction',{item,id:item.id,action,actionId:action.id,originalEvent:event}); }}></cb-button>
                    `, {key: action => action.id})}
                    ${() => this.rendered(item,index,true)}<slot name=${`actions-${item.id}`} part="actions-slot"></slot>
                </div></div>
                <div part="panel" id=${id(item,'panel')} role="region" aria-labelledby=${id(item,'trigger')}
                    aria-hidden=${() => !this.itemExpanded(item.id)} inert=${() => !this.itemExpanded(item.id) ? '' : null}>
                    <div part="panel-content"><div part="panel-inner"><slot part="content" name=${() => scalarText(item.slot).trim() || `item-${item.id}`}>
                        ${() => this.rendered(item,index)}</slot></div></div>
                </div>
                <div part="disabled-reason" id=${id(item,'reason')} hidden=${() => !this.itemDisabled(item) || !item.disabledReason}>${() => this.itemDisabled(item) ? item.disabledReason : ''}</div>
            </section>`, {key: item => item.id})}
            <div part="empty" role="status" hidden=${() => this.itemList().length > 0 || !this.emptyLabel}>${() => this.emptyLabel}</div>
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
