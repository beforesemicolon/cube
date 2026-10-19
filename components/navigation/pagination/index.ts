import { html, repeat, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { PaginationBase } from './PaginationBase.js'
const css = editorCSS + `:host{display:inline-block}[part=pages]{display:flex;align-items:center;gap:2px}[part=page]{display:grid;place-items:center;min-inline-size:28px;min-block-size:28px;padding:3px 6px;border-color:transparent;background:transparent}[part=page][aria-current=page]{color:var(--color-signal-text,#1d50b3);background:var(--color-selection,#eaf1ff);border-color:var(--color-primary,#2563eb)}[part=ellipsis]{display:grid;place-items:center;min-inline-size:20px;color:var(--color-muted-foreground,#606b73)}`;
export class Pagination extends PaginationBase {
    render(): Template {
        return html`<style part="styles">${css}</style><nav part="navigation" aria-label="${this.accessibleName}"><div part="pages">
            <cb-button part="previous" exportparts="control:previous-control,label:previous-label,button-label:previous-label,icon:previous-icon,description:previous-description" variant="ghost" icon="left" icon-only="true" accessible-label="${this.props.previousLabel}"
                disabled="${() => this.unavailable || this.currentPage <= 1}"
                onaction="${(event: Event) => this.selectPage(this.currentPage - 1, event)}"></cb-button>
            ${repeat(() => this.pages, (value, index) => value === 'ellipsis'
                ? html`<span part="ellipsis">…</span>`
                : html`<cb-button part="page" exportparts="control:page-control,label:page-label,button-label:page-label,icon:page-icon,description:page-description" data-bare data-semantic-host label="${String(value)}"
                    accessible-label="${() => this.labelForPage(value) || String(value)}" disabled="${() => this.unavailable}"
                    aria-current="${() => value === this.currentPage ? 'page' : null}"
                    onaction="${(event: Event) => this.selectPage(value, event)}"></cb-button>`,
                { key: (value, index) => value === 'ellipsis' ? 'ellipsis-' + index : value })}
            <cb-button part="next" exportparts="control:next-control,label:next-label,button-label:next-label,icon:next-icon,description:next-description" variant="ghost" icon="right" icon-only="true" accessible-label="${this.props.nextLabel}"
                disabled="${() => this.unavailable || this.currentPage >= this.pageCount}"
                onaction="${(event: Event) => this.selectPage(this.currentPage + 1, event)}"></cb-button>
        </div></nav>`
    }
}
export { PaginationBase };
export type { PaginationProps } from './PaginationBase.js';
