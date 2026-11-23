type Direction = -1 | 1

const edgeTolerance = 1

/** Owns the overflow controls for an inline menu, not its item selection. */
export class MenuScrollControls {
    private resizeObserver?: ResizeObserver
    private mutationObserver?: MutationObserver
    private frameRequest?: number

    constructor(
        private frame: HTMLElement,
        private menu: HTMLElement,
        private previous: () => HTMLElement | undefined,
        private next: () => HTMLElement | undefined,
        private vertical: () => boolean,
        private enabled: () => boolean,
        private focusItem: () => void
    ) {}

    mount(): () => void {
        this.refresh()
        return () => this.stopObserving()
    }

    refresh(): void {
        if (!this.enabled()) {
            if (this.resizeObserver) {
                this.stopObserving()
                this.update()
            }
            return
        }
        if (!this.resizeObserver) {
            this.resizeObserver = new ResizeObserver(this.schedule)
            this.mutationObserver = new MutationObserver(() => {
                this.observeSizes()
                this.schedule()
            })
            this.observeSizes()
            this.mutationObserver.observe(this.menu, { childList: true })
            this.menu.addEventListener('scroll', this.schedule, { passive: true })
        }
        this.schedule()
    }

    private stopObserving(): void {
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
        this.mutationObserver?.disconnect()
        this.mutationObserver = undefined
        this.menu.removeEventListener('scroll', this.schedule)
        if (this.frameRequest !== undefined) {
            cancelAnimationFrame(this.frameRequest)
            this.frameRequest = undefined
        }
    }

    schedule = (): void => {
        if (this.frameRequest !== undefined) return
        this.frameRequest = requestAnimationFrame(() => {
            this.frameRequest = undefined
            this.update()
        })
    }

    reveal(direction: Direction): void {
        const axis = this.axis()
        const offset = this.offset(axis)
        const max = this.extent(axis) - this.viewport(axis)
        const viewport = this.bounds(this.menu, axis)
        const items = Array.from(this.menu.children).filter(
            (item) => item.matches('[part~="item"], [part~="custom-item"]')
        )
        if (direction < 0) items.reverse()

        const hidden = items
            .map((item) => this.bounds(item, axis))
            .find(({ start, end }) =>
                direction > 0
                    ? end > viewport.end + edgeTolerance
                    : start < viewport.start - edgeTolerance
            )
        const delta = hidden
            ? direction > 0
                ? hidden.end - viewport.end
                : hidden.start - viewport.start
            : direction > 0
              ? max - offset
              : -offset

        const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth'
        this.menu.scrollBy(
            axis === 'vertical'
                ? { top: delta, behavior }
                : { left: axis === 'rtl' ? -delta : delta, behavior }
        )
    }

    private observeSizes(): void {
        this.resizeObserver?.disconnect()
        this.resizeObserver?.observe(this.frame)
        this.resizeObserver?.observe(this.menu)
        for (const item of this.menu.children) this.resizeObserver?.observe(item)
    }

    private axis(): 'vertical' | 'ltr' | 'rtl' {
        if (this.vertical()) return 'vertical'
        return getComputedStyle(this.menu).direction === 'rtl' ? 'rtl' : 'ltr'
    }

    private extent(axis: ReturnType<MenuScrollControls['axis']>): number {
        return axis === 'vertical' ? this.menu.scrollHeight : this.menu.scrollWidth
    }

    private viewport(axis: ReturnType<MenuScrollControls['axis']>): number {
        return axis === 'vertical' ? this.menu.clientHeight : this.menu.clientWidth
    }

    private offset(axis: ReturnType<MenuScrollControls['axis']>): number {
        if (axis === 'vertical') return this.menu.scrollTop
        return this.menu.scrollLeft * (axis === 'rtl' ? -1 : 1)
    }

    private bounds(
        item: Element,
        axis: ReturnType<MenuScrollControls['axis']>
    ): { start: number; end: number } {
        const rect = item.getBoundingClientRect()
        if (axis === 'vertical') {
            return { start: rect.top, end: rect.top + (item === this.menu ? this.menu.clientHeight : rect.height) }
        }
        const size = item === this.menu ? this.menu.clientWidth : rect.width
        if (axis === 'rtl') return { start: -rect.right, end: -rect.right + size }
        return { start: rect.left, end: rect.left + size }
    }

    private update(): void {
        const axis = this.axis()
        const available = this.frame.hasAttribute('data-overflow')
            ? axis === 'vertical' ? this.frame.clientHeight : this.frame.clientWidth
            : this.viewport(axis)
        const overflow =
            this.enabled() && this.extent(axis) > available + edgeTolerance
        this.frame.toggleAttribute('data-overflow', overflow)
        const offset = this.offset(axis)
        const max = this.extent(axis) - this.viewport(axis)
        const previous = overflow && offset > edgeTolerance
        const next = overflow && max - offset > edgeTolerance
        const focused = (this.frame.getRootNode() as ShadowRoot).activeElement

        const previousButton = this.previous()
        const nextButton = this.next()
        if (previousButton) previousButton.hidden = !previous
        if (nextButton) nextButton.hidden = !next
        if ((focused === previousButton && !previous) || (focused === nextButton && !next)) {
            if (previous) previousButton?.focus({ preventScroll: true })
            else if (next) nextButton?.focus({ preventScroll: true })
            else this.focusItem()
        }
    }
}
