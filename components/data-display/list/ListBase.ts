import { Component, type CommonProps } from '../../core/Component.js'
import { state, type Template } from '../../core/runtime.js'

export type ListOrientation = 'vertical' | 'horizontal'
export type ListItems<T, K = number> = Iterable<T> | ReadonlyMap<K, T>
export type ListRenderer<T, K = number> = (item: T, indexOrKey: K | number) => Element | Template

export interface ListProps<T = string, K = number> extends CommonProps {
    gap: string | number
    orientation: ListOrientation
    offset: number
    items: ListItems<T, K>
    renderItem: ListRenderer<T, K> | null
}

export interface ListLoadMoreDetail {
    readonly orientation: ListOrientation
    readonly itemCount: number
    readonly scrollOffset: number
    readonly scrollSize: number
    readonly viewportSize: number
    readonly remaining: number
}

interface ListEntry<T, K> {
    readonly item: T
    readonly key: K | number
}

function isMap<T, K>(items: ListItems<T, K>): items is ReadonlyMap<K, T> {
    return items instanceof Map
}

/** Unstyled scrolling/rendering behavior; item content belongs to the consumer. */
export abstract class ListBase<T = string, K = number> extends Component<ListProps<T, K>> {
    static observedAttributes = [...Component.observedAttributes, 'gap', 'orientation', 'offset', 'items']
    gap: string | number = 0
    orientation: ListOrientation = 'vertical'
    offset = 100
    items: ListItems<T, K> = []

    // A function passed to an observed prop is treated as a state updater by
    // Markup. Box the renderer so it remains a callback, not an updater.
    private readonly rendererState = state<{ render: ListRenderer<T, K> | null }>({ render: null })
    get renderItem(): ListRenderer<T, K> | null { return this.rendererState[0]().render }
    set renderItem(render: ListRenderer<T, K> | null) {
        this.rendererState[1]({ render })
        this.queueCheck()
    }

    private source: ListItems<T, K> | null = null
    private cachedEntries: ListEntry<T, K>[] = []
    private nearEnd = false
    private frame: number | null = null

    protected entries = (): readonly ListEntry<T, K>[] => {
        const items = this.props.items()
        if (items !== this.source) {
            this.source = items
            const previous = new Map(this.cachedEntries.map(entry => [entry.key, entry]))
            const entryFor = (item: T, key: K | number): ListEntry<T, K> => {
                const previousEntry = previous.get(key)
                return previousEntry && Object.is(previousEntry.item, item) ? previousEntry : { item, key }
            }
            const iterable = items && typeof items[Symbol.iterator] === 'function' ? items : []
            this.cachedEntries = isMap(iterable)
                ? Array.from(iterable, ([key, item]) => entryFor(item, key))
                : Array.from(iterable, entryFor)
        }
        return this.cachedEntries
    }

    protected renderedItem = (entry: ListEntry<T, K>): Element | Template | null =>
        this.renderItem?.(entry.item, entry.key) ?? null

    protected visibleEntries = (): readonly ListEntry<T, K>[] => this.renderItem ? this.entries() : []

    protected direction = (): ListOrientation => this.props.orientation() === 'horizontal' ? 'horizontal' : 'vertical'
    protected itemGap = (): string => {
        const gap = this.props.gap()
        return typeof gap === 'number' ? `${Number.isFinite(gap) ? Math.max(0, gap) : 0}px` : gap
    }

    protected mount(): void {
        this.listen(this, 'scroll', this.handleScroll)
        const observer = new ResizeObserver(this.queueCheck)
        observer.observe(this)
        const content = this.refs.items?.[0]
        if (content) observer.observe(content)
        this.cleanup(() => observer.disconnect())
        this.queueCheck()
    }

    protected update(name: string): void {
        if (name === 'items' || name === 'orientation') this.nearEnd = false
        // Offset does not change layout. Apply it now so a scroll before the
        // next animation frame cannot inherit the old threshold's latch.
        if (name === 'offset') this.checkEnd()
        this.queueCheck()
    }

    protected unmount(): void {
        if (this.frame !== null) this.ownerDocument.defaultView?.cancelAnimationFrame(this.frame)
        this.frame = null
        this.nearEnd = false
    }

    private handleScroll = (event: Event): void => {
        if (event.target === this) this.checkEnd()
    }

    private queueCheck = (): void => {
        if (!this.mounted || this.frame !== null) return
        this.frame = this.ownerDocument.defaultView?.requestAnimationFrame(() => {
            this.frame = null
            this.checkEnd()
        }) ?? null
    }

    private checkEnd = (): void => {
        const horizontal = this.direction() === 'horizontal'
        const viewportSize = horizontal ? this.clientWidth : this.clientHeight
        if (viewportSize <= 0 || this.getClientRects().length === 0) return
        const scrollSize = horizontal ? this.scrollWidth : this.scrollHeight
        // RTL horizontal scrollers use negative scrollLeft values.
        const scrollOffset = horizontal ? Math.abs(this.scrollLeft) : Math.max(0, this.scrollTop)
        const remaining = Math.max(0, scrollSize - viewportSize - scrollOffset)
        const offset = Number(this.offset)
        const nearEnd = remaining <= (Number.isFinite(offset) ? Math.max(0, offset) : 0)
        if (!nearEnd) { this.nearEnd = false; return }
        if (this.nearEnd) return
        this.nearEnd = true
        const detail: ListLoadMoreDetail = {
            orientation: this.direction(), itemCount: this.entries().length,
            scrollOffset, scrollSize, viewportSize, remaining,
        }
        this.emit('loadmoreitems', detail)
    }
}
