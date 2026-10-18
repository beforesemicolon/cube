import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { actionLabel, createIconButton } from '../../action/create.js'
import { PaginationBase } from './PaginationBase.js'

export class Pagination extends PaginationBase {
    private nav?: HTMLElement
    private list?: HTMLElement
    render(): Node {
        this.nav = el('nav', 'navigation'); this.list = el('div', 'pages'); this.nav.append(this.list)
        return fragment(sheet(editorCSS + `:host{display:inline-block}[part=pages]{display:flex;align-items:center;gap:2px}[part=page]{display:grid;place-items:center;min-inline-size:28px;min-block-size:28px;padding:3px 6px;border-color:transparent;background:transparent}[part=page][aria-current=page]{color:var(--color-signal-text,#1d50b3);background:var(--color-selection,#eaf1ff);border-color:var(--color-primary,#2563eb)}[part=ellipsis]{display:grid;place-items:center;min-inline-size:20px;color:var(--color-muted-foreground,#606b73)}`), this.nav)
    }
    protected syncView(): void {
        if (!this.nav || !this.list) return
        this.nav.setAttribute('aria-label', this.accessibleName())
        const previous = createIconButton('previous', 'left', event => this.selectPage(this.currentPage - 1, event)); actionLabel(previous, this.previousLabel); previous.disabled = this.unavailable || this.currentPage <= 1
        const next = createIconButton('next', 'right', event => this.selectPage(this.currentPage + 1, event)); actionLabel(next, this.nextLabel); next.disabled = this.unavailable || this.currentPage >= this.pageCount
        const pages = this.pages.map(value => {
            if (value === 'ellipsis') return el('span', 'ellipsis', '…')
            const button = el('button', 'page', String(value)); button.type = 'button'; button.disabled = this.unavailable
            const label = this.labelForPage(value); if (label) button.setAttribute('aria-label', label); if (value === this.currentPage) button.setAttribute('aria-current', 'page')
            button.addEventListener('click', event => this.selectPage(value, event)); return button
        })
        this.list.replaceChildren(previous, ...pages, next)
    }
}

register('cb-pagination', Pagination)
export { PaginationBase }
export type { PaginationProps } from './PaginationBase.js'
