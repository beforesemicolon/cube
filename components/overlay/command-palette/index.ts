import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import type { Menu } from '../../navigation/menu/index.js';
import type { TextInput } from '../../form/text-input/index.js';
import type { NormalizedItem } from '../../core/items.js';
import { bool, scalarText } from '../../core/value.js';
import { createIcon } from '../../icons/paths.js';
import { CommandPaletteBase } from './CommandPaletteBase.js';
export class CommandPalette extends CommandPaletteBase {
    private dialog?: HTMLDialogElement;
    private input?: TextInput;
    private menu?: Menu;
    private empty?: HTMLElement;
    render(): Template {
        this.dialog = element('dialog', { attributes: { part: 'dialog' } }) as HTMLDialogElement;
        const search = element('label', { attributes: { part: 'search' } }) as HTMLLabelElement;
        search.append(createIcon('search'));
        this.input = document.createElement('cb-text-input') as TextInput;
        this.input.setAttribute('part', 'input');
        this.input.setAttribute('exportparts', 'control:input-control');
        this.input.addEventListener('change', event => { event.stopPropagation(); this.query = scalarText((event as CustomEvent<{
            value: string;
        }>).detail.value); this.syncView(); });
        search.append(this.input);
        this.menu = document.createElement('cb-menu') as Menu;
        this.menu.setAttribute('part', 'results');
        this.menu.addEventListener('action', event => { event.stopPropagation(); const detail = (event as CustomEvent<{
            item: NormalizedItem;
        }>).detail; if (detail.item)
            this.select(detail.item, event); });
        this.empty = element('p', { attributes: { part: 'empty' } }) as HTMLParagraphElement;
        this.dialog.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); this.close(); });
        this.dialog.append(search, this.menu, this.empty);
        return html`<style part="styles">${editorCSS + `:host{display:contents}[part=dialog]{inline-size:min(560px,calc(100vw - 24px));max-block-size:min(70dvh,640px);padding:var(--spacing-sm,8px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-md,10px);background:var(--color-surface-raised,#fff);color:var(--color-foreground,#20262b);box-shadow:0 24px 70px rgba(12,18,24,.24)}[part=dialog]::backdrop{background:var(--component-overlay-backdrop,rgba(10,16,22,.56))}[part=search]{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:var(--spacing-sm,8px);padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border:1px solid var(--color-border,#8a959f);border-radius:var(--radius-sm,6px)}[part=input]{display:block;inline-size:100%;min-inline-size:0;--component-studio-control-width:100%;--component-studio-control-min-width:0}[part=input]::part(control){min-block-size:28px;padding:0;border:0;background:transparent;outline:0}[part=results]{margin-block-start:var(--spacing-sm,8px)}[part=empty]{padding:var(--spacing-lg,16px);text-align:center}`}</style>${this.dialog}`;
    }
    protected syncView(): void {
        if (!this.dialog || !this.input || !this.menu || !this.empty)
            return;
        this.input.placeholder = scalarText(this.placeholder);
        this.input.accessibleLabel = this.accessibleName();
        if (this.input.value !== scalarText(this.query))
            this.input.value = scalarText(this.query);
        Object.assign(this.menu, { items: this.results, accessibleLabel: this.accessibleName() });
        this.empty.textContent = scalarText(this.emptyLabel);
        this.empty.hidden = this.results.length > 0 || !this.empty.textContent;
        if (bool(this.open) && !this.dialog.open) {
            try {
                this.dialog.showModal();
                this.input.focus();
            }
            catch (error) {
                this.onError(error);
            }
        }
        else if (!bool(this.open) && this.dialog.open)
            this.dialog.close();
    }
}
export { CommandPaletteBase };
export type { CommandPaletteProps } from './CommandPaletteBase.js';
