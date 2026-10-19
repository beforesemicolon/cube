import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { RovingFocus } from '../../core/roving.js';
import { scalarText } from '../../core/value.js';
import { actionLabel, createBareButton, createIconButton } from '../../action/create.js';
import { TabsBase } from './TabsBase.js';
export class Tabs extends TabsBase {
    private list?: HTMLElement;
    private roving?: RovingFocus;
    render(): Template {
        this.list = element('div', { attributes: { part: 'tablist' } }) as HTMLDivElement;
        this.list.setAttribute('role', 'tablist');
        this.roving = new RovingFocus(() => Array.from(this.list?.querySelectorAll<HTMLElement>('cb-button[role=tab]:not([disabled])') ?? []), () => this.navigationAxis, index => { if (this.activation === 'automatic')
            this.list?.querySelectorAll<HTMLElement>('cb-button[role=tab]:not([disabled])')[index]?.click(); });
        this.list.addEventListener('keydown', event => this.roving?.keydown(event));
        return html`<style part="styles">${editorCSS + `:host{display:block}[part=tablist]{display:flex;align-items:flex-end;gap:var(--spacing-lg,16px);border-block-end:1px solid var(--color-separator,#dae0e4);overflow:auto}:host([data-stacked]) [part=tablist]{flex-direction:column;align-items:stretch;border-block-end:0;border-inline-end:1px solid var(--color-separator,#dae0e4)}[part=tab-item]{position:relative;display:flex;align-items:center;min-inline-size:0}[part=tab]{position:relative;min-block-size:32px;padding:4px 2px;border:0;border-radius:0;background:transparent;color:var(--color-muted-foreground,#606b73);overflow:hidden;text-overflow:ellipsis}[part=tab][aria-selected=true]{color:var(--color-foreground,#20262b)}[part=tab][aria-selected=true]::after{content:'';position:absolute;inset-inline:0;inset-block-end:-1px;block-size:2px;background:var(--color-primary,#2563eb)}[part=dirty]{inline-size:6px;block-size:6px;border-radius:50%;background:var(--color-warning);flex:none}[part=close]{margin-inline-start:2px}:host([data-stacked]) [part=tab-item]{inline-size:100%}:host([data-stacked]) [part=tab]{flex:1;text-align:start}:host([data-stacked]) [part=tab][aria-selected=true]::after{inset-inline-start:auto;inset-inline-end:-1px;inset-block:0;inline-size:2px;block-size:auto}`}</style>${this.list}`;
    }
    protected syncView(): void {
        if (!this.list)
            return;
        const choices = this.choices;
        const selected = choices.some(item => item.id === scalarText(this.value)) ? scalarText(this.value) : choices.find(item => !item.disabled)?.id ?? '';
        if (!scalarText(this.value) && selected)
            this.value = selected;
        this.toggleAttribute('data-stacked', this.navigationAxis === 'vertical');
        this.list.setAttribute('aria-orientation', this.navigationAxis);
        this.list.setAttribute('aria-label', this.accessibleName());
        this.list.replaceChildren(...choices.map(item => {
            const source = this.items.find(candidate => scalarText(candidate.id) === item.id);
            const wrapper = element('div', { attributes: { part: 'tab-item' } }) as HTMLDivElement;
            const tab = createBareButton('tab', event => this.choose(item, event));
            actionLabel(tab, item.label);
            tab.dataset.label = item.label;
            tab.disabled = this.unavailable || item.disabled;
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', String(item.id === selected));
            tab.id = `${this.id || 'cb-tabs'}-${item.id}-tab`;
            tab.setAttribute('aria-controls', `${this.id || 'cb-tabs'}-${item.id}-panel`);
            wrapper.append(tab);
            if (source?.dirty) {
                const dirty = element('span', { attributes: { part: 'dirty' } }) as HTMLSpanElement;
                dirty.setAttribute('aria-hidden', 'true');
                wrapper.append(dirty);
            }
            if (source?.closable) {
                const close = createIconButton('close', 'close', event => this.closeTab(source, event));
                actionLabel(close, scalarText(this.closeLabel).replaceAll('{tab}', item.label));
                close.size = 'xs';
                close.disabled = this.unavailable || item.disabled;
                wrapper.append(close);
            }
            return wrapper;
        }));
        const index = Math.max(0, choices.findIndex(item => item.id === selected && !item.disabled));
        this.roving?.reset(index);
    }
}
export { TabsBase };
export type { TabsProps, TabItem } from './TabsBase.js';
