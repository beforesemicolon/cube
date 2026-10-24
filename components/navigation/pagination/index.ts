import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { or, html, repeat, type Template } from '../../core/runtime.js'

import { PaginationBase } from './PaginationBase.js'

export class Pagination extends PaginationBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<nav part="navigation" aria-label="${this.accessibleName}"><div part="pages">
            <cb-button part="previous" exportparts="control:previous-control,label:previous-label,button-label:previous-label,icon:previous-icon,description:previous-description" variant="ghost" icon="left" icon-only="true" accessible-label="${this.props.previousLabel}"
                disabled="${or(() => this.unavailable, () => this.currentPage <= 1)}"
                onbeforeaction="${(event: Event) => event.stopPropagation()}"
                onaction="${(event: Event) => this.selectPage(this.currentPage - 1, event)}"></cb-button>
            ${repeat(() => this.pages, (value, index) => value === 'ellipsis' ? html`<span part="ellipsis">…</span>` : html`<cb-button part="page" exportparts="control:page-control,label:page-label,button-label:page-label,icon:page-icon,description:page-description" data-bare data-semantic-host label="${String(value)}"
                    accessible-label="${() => this.labelForPage(value) || String(value)}" disabled="${() => this.unavailable}"
                    aria-current="${() => value === this.currentPage ? 'page' : null}"
                    onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: Event) => this.selectPage(value, event)}"></cb-button>`,
                { key: (value, index) => value === 'ellipsis' ? 'ellipsis-' + index : value })}
            <cb-button part="next" exportparts="control:next-control,label:next-label,button-label:next-label,icon:next-icon,description:next-description" variant="ghost" icon="right" icon-only="true" accessible-label="${this.props.nextLabel}"
                disabled="${or(() => this.unavailable, () => this.currentPage >= this.pageCount)}"
                onbeforeaction="${(event: Event) => event.stopPropagation()}"
                onaction="${(event: Event) => this.selectPage(this.currentPage + 1, event)}"></cb-button>
        </div></nav>`
    }
}
export { PaginationBase };
export type { PaginationProps } from './PaginationBase.js';

register('cb-pagination', Pagination)
