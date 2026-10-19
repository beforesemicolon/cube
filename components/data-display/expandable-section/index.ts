import { element, html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { uid } from '../../core/id.js'
import { bool, scalarText } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import { createBareButton } from '../../action/create.js';
import { ExpandableSectionBase } from './ExpandableSectionBase.js';
const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0}
[part~=root]{display:grid;grid-template-columns:minmax(0,1fr) auto;inline-size:100%;min-inline-size:0}
[part~=trigger]{grid-column:1;display:block;min-block-size:var(--component-expandable-section-header-height,40px);padding:0;border:0;border-radius:0;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:start}
[part~=trigger]::part(control){display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start;gap:var(--spacing-sm,8px);inline-size:100%;min-block-size:100%;padding:var(--component-expandable-section-header-padding,var(--spacing-sm,8px) 0);text-align:inherit}
[part~=trigger]::part(button-label){display:contents}
button[part~=trigger]:hover:not(:disabled),button[part~=trigger]:active:not(:disabled){background:transparent}
[part~=trigger]:hover [part~=label],[part~=trigger]:hover [part~=icon],[part~=trigger]:active [part~=label],[part~=trigger]:active [part~=icon]{color:var(--component-expandable-section-hover-color,${v('--color-primary-hover')})}
[part~=trigger]:focus-within{outline:var(--focus-ring);outline-offset:2px}
[part~=icon]{margin-block-start:1px;color:var(--component-expandable-section-icon-color,currentColor);transition:color var(--motion-duration-fast,100ms) ease-out}
[part~=heading]{display:block;min-inline-size:0}
[part~=label-row]{display:flex;align-items:baseline;gap:var(--spacing-sm,8px);min-inline-size:0}
[part~=label]{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color var(--motion-duration-fast,100ms) ease-out}
[part~=counter]{color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px);font-variant-numeric:tabular-nums}
[part~=description]{display:block;margin-block-start:var(--spacing-xs,4px);color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px)}
[part~=header-extras]{grid-column:2;display:flex;align-items:center;gap:var(--spacing-xs,4px);padding-block:var(--spacing-xs,4px);padding-inline-start:var(--spacing-sm,8px)}
[part~=header-extras][hidden]{display:none}
[part~=panel]{grid-column:1/-1;min-inline-size:0}
[part~=content]{display:block;padding:var(--component-expandable-section-content-padding,var(--spacing-md,12px) 0)}
:host([data-disable-content-padding]) [part~=content]{padding:0}
:host([data-variant=default]) [part~=root]{border-block-end:1px solid var(--component-expandable-section-border,${v('--color-separator')})}
:host([data-variant=default][data-expanded]) [part~=root]{border-block-end:0}
:host([data-variant=default][data-expanded]) [part~=panel]{border-block-start:1px solid var(--component-expandable-section-border,${v('--color-separator')})}
:host([data-variant=container]) [part~=root]{border:1px solid ${v('--color-separator')};border-radius:var(--radius-md,10px);background:${v('--color-surface')};overflow:hidden}
:host([data-variant=container]) [part~=trigger]::part(control){padding:var(--spacing-md,12px)}
:host([data-variant=container]) [part~=header-extras]{padding:var(--spacing-sm,8px) var(--spacing-md,12px) var(--spacing-sm,8px) 0}
:host([data-variant=container][data-expanded]) [part~=panel]{border-block-start:1px solid var(--component-expandable-section-border,${v('--color-separator')})}
:host([data-variant=container]) [part~=content]{padding:var(--spacing-md,12px)}
:host([data-variant=container][data-disable-content-padding]) [part~=content]{padding:0}
:host([data-variant=footer]) [part~=root]{border-block-start:1px solid ${v('--color-separator')}}
:host([data-disabled]) [part~=trigger]{cursor:not-allowed;color:${v('--color-muted-foreground')};opacity:var(--component-disabled-opacity,.5)}
@container(max-width:480px){[part~=root]{grid-template-columns:minmax(0,1fr)}[part~=header-extras]{grid-column:1;padding:0 0 var(--spacing-sm,8px) calc(var(--component-icon-size,16px) + var(--spacing-sm,8px))}}
`;
interface IconElement extends HTMLElement {
    name: string;
    decorative: boolean;
}
function expandableSectionView(host: ExpandableSectionBase) {
    const root = element('section', { attributes: { part: 'root' } }) as HTMLElement;
    const trigger = createBareButton('header trigger', event => { event.preventDefault(); host.toggle(event); });
    const icon = document.createElement('cb-icon') as IconElement;
    icon.name = 'right';
    icon.decorative = true;
    icon.setAttribute('part', 'icon');
    const heading = element('span', { attributes: { part: 'heading' } }) as HTMLSpanElement, labelRow = element('span', { attributes: { part: 'label-row' } }) as HTMLSpanElement, label = element('span', { attributes: { part: 'label' } }) as HTMLSpanElement, counter = element('span', { attributes: { part: 'counter' } }) as HTMLSpanElement;
    const accessibleAction = element('span', { attributes: { part: 'accessible-action sr-only' } }) as HTMLSpanElement;
    const description = element('span', { attributes: { part: 'description' } }) as HTMLSpanElement, extras = element('div', { attributes: { part: 'header-extras' } }) as HTMLDivElement, panel = element('div', { attributes: { part: 'panel' } }) as HTMLDivElement, content = element("slot", { attributes: { name: "", part: "content" }, textContent: "" }) as HTMLSlotElement;
    const info = element("slot", { attributes: { name: 'header-info', part: 'header-info' }, textContent: '' }) as HTMLSlotElement, actions = element("slot", { attributes: { name: 'header-actions', part: 'header-actions' }, textContent: '' }) as HTMLSlotElement;
    const triggerId = uid('cb-expandable-trigger'), panelId = uid('cb-expandable-panel');
    trigger.id = triggerId;
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    heading.setAttribute('role', 'heading');
    labelRow.append(label, document.createTextNode(' '), counter);
    heading.append(labelRow, document.createTextNode(' '), description);
    trigger.append(icon, heading, document.createTextNode(' '), accessibleAction);
    extras.append(info, actions);
    panel.append(content);
    root.append(trigger, extras, panel);
    const syncExtras = (): void => { extras.hidden = info.assignedElements().length + actions.assignedElements().length === 0; };
    info.addEventListener('slotchange', syncExtras);
    actions.addEventListener('slotchange', syncExtras);
    const update = (): void => {
        const expanded = bool(host.expanded), disabled = bool(host.disabled);
        const visibleLabel = scalarText(host.label), visibleCounter = scalarText(host.counter), visibleDescription = scalarText(host.description), extraName = scalarText(host.accessibleLabel);
        root.toggleAttribute('data-expanded', expanded);
        root.dataset.variant = host.resolvedVariant();
        host.dataset.variant = host.resolvedVariant();
        host.toggleAttribute('data-expanded', expanded);
        host.toggleAttribute('data-disable-content-padding', bool(host.disableContentPadding));
        icon.name = expanded ? 'down' : 'right';
        trigger.disabled = disabled;
        aria(trigger, 'aria-disabled', disabled || null);
        trigger.accessibleLabel = [visibleLabel, visibleCounter, visibleDescription, extraName].filter(Boolean).join(' ');
        accessibleAction.textContent = visibleLabel && extraName !== visibleLabel ? extraName : '';
        aria(trigger, 'aria-controls', panelId);
        aria(trigger, 'aria-expanded', expanded);
        aria(panel, 'aria-labelledby', triggerId);
        panel.hidden = !expanded;
        panel.inert = !expanded;
        heading.setAttribute('aria-level', String(host.resolvedHeadingLevel()));
        aria(heading, 'aria-label', visibleLabel || extraName || null);
        label.textContent = visibleLabel;
        counter.textContent = visibleCounter;
        counter.hidden = !counter.textContent;
        description.textContent = visibleDescription;
        description.hidden = !description.textContent;
        syncExtras();
    };
    return { root: html`<style part="styles">${css}</style>${root}`, update };
}
export class ExpandableSection extends ExpandableSectionBase {
    private view?: ReturnType<typeof expandableSectionView>;
    render(): Template { this.view = expandableSectionView(this); return html`${this.view.root}`; }
    protected syncView(): void { this.view?.update(); }
}
export { ExpandableSectionBase };
export type { ExpandableSectionChangeDetail, ExpandableSectionProps, ExpandableSectionVariant } from './ExpandableSectionBase.js';
