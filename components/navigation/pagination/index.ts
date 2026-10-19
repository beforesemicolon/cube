import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { actionLabel, createBareButton, createIconButton } from '../../action/create.js';
import { PaginationBase } from './PaginationBase.js';
export class Pagination extends PaginationBase {
    private nav?: HTMLElement;
    private list?: HTMLElement;
    render(): Template {
        this.nav = element('nav', { attributes: { part: 'navigation' } }) as HTMLElement;
        this.list = element('div', { attributes: { part: 'pages' } }) as HTMLDivElement;
        this.nav.append(this.list);
        return html`<style part="styles">${editorCSS + `:host{display:inline-block}[part=pages]{display:flex;align-items:center;gap:2px}[part=page]{display:grid;place-items:center;min-inline-size:28px;min-block-size:28px;padding:3px 6px;border-color:transparent;background:transparent}[part=page][aria-current=page]{color:var(--color-signal-text,#1d50b3);background:var(--color-selection,#eaf1ff);border-color:var(--color-primary,#2563eb)}[part=ellipsis]{display:grid;place-items:center;min-inline-size:20px;color:var(--color-muted-foreground,#606b73)}`}</style>${this.nav}`;
    }
    protected syncView(): void {
        if (!this.nav || !this.list)
            return;
        this.nav.setAttribute('aria-label', this.accessibleName());
        const previous = createIconButton('previous', 'left', event => this.selectPage(this.currentPage - 1, event));
        actionLabel(previous, this.previousLabel);
        previous.disabled = this.unavailable || this.currentPage <= 1;
        const next = createIconButton('next', 'right', event => this.selectPage(this.currentPage + 1, event));
        actionLabel(next, this.nextLabel);
        next.disabled = this.unavailable || this.currentPage >= this.pageCount;
        const pages = this.pages.map(value => {
            if (value === 'ellipsis')
                return element('span', { attributes: { part: 'ellipsis' }, textContent: '…' }) as HTMLSpanElement;
            const button = createBareButton('page', event => this.selectPage(value, event));
            button.disabled = this.unavailable;
            const label = this.labelForPage(value);
            actionLabel(button, String(value));
            if (label)
                button.accessibleLabel = label;
            if (value === this.currentPage)
                button.setAttribute('aria-current', 'page');
            return button;
        });
        this.list.replaceChildren(previous, ...pages, next);
    }
}
export { PaginationBase };
export type { PaginationProps } from './PaginationBase.js';
