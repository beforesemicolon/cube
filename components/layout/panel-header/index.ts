import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { bool, scalarText } from '../../core/value.js';
import { actionLabel, createIconButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
import { PanelHeaderBase } from './PanelHeaderBase.js';
export class PanelHeader extends PanelHeaderBase {
    private heading?: HTMLSlotElement;
    private descriptionNode?: HTMLElement;
    private toggleButton?: Button;
    render(): Template {
        const header = element('header', { attributes: { part: 'header' } }) as HTMLElement;
        const copy = element('div', { attributes: { part: 'copy' } }) as HTMLDivElement;
        this.heading = element("slot", { attributes: { name: 'heading', part: 'heading' }, textContent: '' }) as HTMLSlotElement;
        this.descriptionNode = element('p', { attributes: { part: 'description' } }) as HTMLParagraphElement;
        this.descriptionNode.dataset.cbDescription = '';
        copy.append(this.heading, this.descriptionNode);
        const actions = element('div', { attributes: { part: 'actions' } }) as HTMLDivElement;
        actions.append(element("slot", { attributes: { name: 'actions', part: 'action-content' }, textContent: '' }) as HTMLSlotElement);
        this.toggleButton = createIconButton('toggle', 'down', event => this.toggleExpanded(event));
        actions.append(this.toggleButton);
        header.append(copy, actions);
        return html`<style part="styles">${editorCSS + `
:host{display:block;min-inline-size:0}
[part~=header]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-md,12px);min-block-size:var(--component-panel-header-height,44px);padding:var(--component-panel-header-padding,var(--spacing-sm,8px) var(--spacing-md,12px));border-block-end:1px solid var(--color-separator);background:var(--component-panel-header-background,var(--color-surface))}
[part~=copy]{min-inline-size:0}[part~=heading]{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:650}[part~=description]:empty{display:none}
[part~=actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px);flex:none}:host(:not([collapsible])) [part~=toggle]{display:none}
:host([collapsible]:not([expanded])) [part~=toggle]{rotate:-90deg}
`}</style>${header}`;
    }
    protected syncView(): void {
        if (!this.heading || !this.descriptionNode || !this.toggleButton)
            return;
        this.heading.textContent = scalarText(this.label);
        this.descriptionNode.textContent = scalarText(this.description);
        this.toggleButton.hidden = !this.isCollapsible();
        this.toggleButton.disabled = this.unavailable;
        this.toggleButton.setAttribute('aria-expanded', String(this.isExpanded()));
        actionLabel(this.toggleButton, this.toggleText());
        this.toggleAttribute('collapsible', this.isCollapsible());
        this.toggleAttribute('expanded', this.isExpanded());
    }
}
export { PanelHeaderBase };
export type { PanelHeaderProps } from './PanelHeaderBase.js';
