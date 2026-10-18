import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { pageRange } from '../../core/items.js'
import { finite } from '../../core/value.js'

export interface PaginationProps extends UIProps { page?: number; totalPages?: number; siblings?: number; previousLabel?: string; nextLabel?: string; pageLabel?: string }

/** Page-range calculation and cancelable selection behavior. */
export abstract class PaginationBase<P extends PaginationProps = PaginationProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'page', 'total-pages', 'siblings', 'previous-label', 'next-label', 'page-label']
    page = 1
    totalPages = 1
    siblings = 1
    previousLabel = ''
    nextLabel = ''
    pageLabel = ''
    protected labelForPage(page: number): string { return this.pageLabel.replaceAll('{page}', String(page)) }
    protected get currentPage(): number { return Math.max(1, Math.min(this.pageCount, Math.trunc(finite(this.page, 1)))) }
    protected get pageCount(): number { return Math.max(1, Math.trunc(finite(this.totalPages, 1))) }
    protected get pages(): Array<number | 'ellipsis'> { return pageRange(this.currentPage, this.pageCount, Math.max(0, Math.trunc(finite(this.siblings, 1)))) }
    protected selectPage(page: number, originalEvent: Event): void {
        const next = Math.max(1, Math.min(this.pageCount, Math.trunc(finite(page, 1))))
        if (next === this.currentPage || this.unavailable) return
        const detail = { page: next, previousPage: this.currentPage, originalEvent }
        if (!this.request('cb-before-change', detail)) return
        this.page = next; this.syncView(); this.emit('cb-change', detail)
    }
}
