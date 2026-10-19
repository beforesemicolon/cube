import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import type { Button } from '../button/index.js';
import { scalarText } from '../../core/value.js';
import { ButtonGroupBase } from './ButtonGroupBase.js';
export class ButtonGroup extends ButtonGroupBase {
    private group?: HTMLElement;
    render(): Template {
        this.group = element('div', { attributes: { part: 'group' } }) as HTMLDivElement;
        this.group.setAttribute('role', 'group');
        return html`<style part="styles">${editorCSS + `
:host{display:inline-block}
[part=group]{display:flex;align-items:stretch}
[part=item]{position:relative;--component-button-radius-start-start:0;--component-button-radius-start-end:0;--component-button-radius-end-end:0;--component-button-radius-end-start:0}
[part=item]:not(:first-child){margin-inline-start:-1px}
[part=item]:first-child{--component-button-radius-start-start:var(--radius-sm,6px);--component-button-radius-end-start:var(--radius-sm,6px)}
[part=item]:last-child{--component-button-radius-start-end:var(--radius-sm,6px);--component-button-radius-end-end:var(--radius-sm,6px)}
[part=item]:focus-within{z-index:1}
`}</style>${this.group}`;
    }
    protected syncView(): void {
        if (!this.group)
            return;
        const label = scalarText(this.accessibleLabel) || scalarText(this.label);
        if (label)
            this.group.setAttribute('aria-label', label);
        else
            this.group.removeAttribute('aria-label');
        this.group.replaceChildren(...this.actions.map(item => {
            const button = document.createElement('cb-button') as Button;
            button.setAttribute('part', 'item');
            button.setAttribute('exportparts', 'control:item-control,label:item-label,icon:item-icon,spinner:item-spinner');
            Object.assign(button, {
                label: item.label,
                description: item.description,
                value: item.id,
                icon: item.icon ?? '',
                disabled: this.unavailable || item.disabled,
                size: this.size,
                variant: this.variant,
            });
            button.addEventListener('beforeaction', event => event.stopPropagation());
            button.addEventListener('action', event => { event.stopPropagation(); this.activate(item, event); });
            return button;
        }));
    }
}
export { ButtonGroupBase };
export type { ButtonGroupProps } from './ButtonGroupBase.js';
