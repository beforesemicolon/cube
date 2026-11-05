export type PopupPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
export type PopupLength = string | number

export interface PopupConstraintProps {
    popupMaxWidth?: PopupLength
    popupMaxHeight?: PopupLength
}

export const popupConstraintAttributes = ['popup-max-width', 'popup-max-height'] as const

export interface PopupControllerOptions {
    readonly placement?: () => PopupPlacement
    /** Optional viewport bounds for caret-anchored or virtual reference popups. */
    readonly anchorBounds?: () => DOMRect
    readonly matchAnchorWidth?: boolean
    readonly maxWidth?: () => PopupLength
    readonly maxHeight?: () => PopupLength
}

interface PopupPoint {
    readonly x: number
    readonly y: number
}

function cssLength(value: PopupLength | null | undefined, fallback: string, property: 'max-width' | 'max-height'): string {
    if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? `${value}px` : fallback
    const normalized = value?.trim() ?? ''
    if (!normalized || normalized === 'none') return fallback
    return typeof CSS === 'undefined' || CSS.supports(property, `min(${normalized}, 1px)`) ? normalized : fallback
}

function containsFocus(container: HTMLElement, doc: Document): boolean {
    let focused = doc.activeElement
    while (focused?.shadowRoot?.activeElement) focused = focused.shadowRoot.activeElement
    let node: Node | null = focused
    while (node) {
        if (node === container) return true
        node = node instanceof Element && node.assignedSlot ? node.assignedSlot
            : node.parentNode ?? (node instanceof ShadowRoot ? node.host : null)
    }
    return false
}

/** Top-layer positioning, viewport constraints and light-dismiss. No document listeners survive close/dispose. */
export class PopupController {
    private cleanup: Array<() => void> = []
    private shown = false
    private reposition?: () => void
    private authoredMaxWidth = 'none'
    private authoredMaxHeight = 'none'

    constructor(
        private popup: HTMLElement,
        private anchor: HTMLElement,
        private onDismiss: (originalEvent: Event) => void,
        private options: PopupControllerOptions = {},
    ) {}

    show(point?: PopupPoint): void {
        if (this.shown) {
            this.reposition?.()
            return
        }

        this.shown = true
        this.popup.hidden = false
        this.popup.setAttribute('popover', 'manual')
        if (typeof this.popup.showPopover === 'function' && !this.popup.matches(':popover-open')) this.popup.showPopover()

        const popupView = this.popup.ownerDocument.defaultView ?? window
        const authoredStyle = popupView.getComputedStyle(this.popup)
        this.authoredMaxWidth = authoredStyle.maxWidth
        this.authoredMaxHeight = authoredStyle.maxHeight

        const place = (): void => {
            const rect = this.options.anchorBounds?.() ?? this.anchor.getBoundingClientRect()
            const placement = this.options.placement?.() ?? 'bottom-start'
            const view = this.popup.ownerDocument.defaultView ?? window
            const viewportWidth = Math.max(0, view.innerWidth - 16)
            const viewportHeight = Math.max(0, view.innerHeight - 16)
            const authoredWidth = this.authoredMaxWidth !== 'none' ? this.authoredMaxWidth : `${viewportWidth}px`
            const authoredHeight = this.authoredMaxHeight !== 'none' ? this.authoredMaxHeight : `${viewportHeight}px`
            const requestedWidth = cssLength(this.options.maxWidth?.(), authoredWidth, 'max-width')
            const requestedHeight = cssLength(this.options.maxHeight?.(), authoredHeight, 'max-height')
            const maximumWidth = `min(${requestedWidth}, ${viewportWidth}px)`
            const maximumHeight = `min(${requestedHeight}, ${viewportHeight}px)`

            Object.assign(this.popup.style, {
                position: 'fixed',
                inset: 'auto',
                margin: '0',
                maxWidth: maximumWidth,
                maxHeight: maximumHeight,
                minWidth: this.options.matchAnchorWidth ? `min(${rect.width}px, ${maximumWidth})` : '',
            })

            const bounds = this.popup.getBoundingClientRect()
            let left = point?.x ?? (placement.endsWith('end') ? rect.right - bounds.width : rect.left)
            let top = point?.y ?? (placement.startsWith('top') ? rect.top - bounds.height - 6 : rect.bottom + 6)
            if (top + bounds.height > view.innerHeight - 8 && !point) top = rect.top - bounds.height - 6
            top = Math.max(8, Math.min(top, view.innerHeight - bounds.height - 8))
            left = Math.max(8, Math.min(left, view.innerWidth - bounds.width - 8))
            this.popup.style.left = `${left}px`
            this.popup.style.top = `${top}px`
        }

        this.reposition = place
        place()

        const doc = this.popup.ownerDocument
        const view = doc.defaultView ?? window
        const listen = (target: EventTarget, name: string, listener: EventListener, capture = false): void => {
            target.addEventListener(name, listener, capture)
            this.cleanup.push(() => target.removeEventListener(name, listener, capture))
        }
        listen(doc, 'pointerdown', event => {
            const path = event.composedPath()
            if (!path.includes(this.popup) && !path.includes(this.anchor)) this.onDismiss(event)
        }, true)
        // Pointer events inside another browsing context never reach this document.
        // Its focus transfer still blurs the window, even for cross-origin frames.
        listen(view, 'blur', event => {
            if (!containsFocus(this.popup, doc) && !containsFocus(this.anchor, doc)) this.onDismiss(event)
        })
        listen(doc, 'keydown', event => {
            const keyboardEvent = event as KeyboardEvent
            if (keyboardEvent.key === 'Escape' && !keyboardEvent.defaultPrevented) {
                keyboardEvent.preventDefault()
                this.onDismiss(keyboardEvent)
                this.anchor.focus()
            }
        })
        listen(view, 'resize', place)
        listen(doc, 'scroll', place, true)
        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(place)
            observer.observe(this.popup)
            observer.observe(this.anchor)
            this.cleanup.push(() => observer.disconnect())
        }
    }

    hide(restoreFocus = false): void {
        if (!this.shown) {
            this.popup.hidden = true
            return
        }
        this.shown = false
        this.reposition = undefined
        this.cleanup.splice(0).forEach(dispose => dispose())
        if (typeof this.popup.hidePopover === 'function' && this.popup.matches(':popover-open')) this.popup.hidePopover()
        this.popup.hidden = true
        if (restoreFocus && this.anchor.isConnected) this.anchor.focus()
    }

    dispose(): void { this.hide(false) }
}
