import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { type Template, html } from '../../core/runtime.js'

import { finite } from '../../core/value.js'
import { ResizablePanelBase } from './ResizablePanelBase.js'

export class ResizablePanel extends ResizablePanelBase {
    stylesheet = componentStylesheet

    private get handle(): HTMLElement | undefined {
        const node = this.refs.handle?.[0]
        return node instanceof HTMLElement ? node : undefined
    }
    private startX = 0
    private startSize = 0
    render(): Template {
        return html`<section part="panel" aria-label=${this.accessibleName}>
                <header part="header">
                    <slot name="heading" part="heading"
                        >${this.props.label}</slot
                    >
                </header>
                <slot part="content"></slot>
            </section>
            <div
                part="resize-handle"
                ref="handle"
                role="separator"
                aria-orientation="vertical"
                tabindex=${() => (this.unavailable ? -1 : 0)}
                aria-label=${this.props.resizeLabel}
                aria-valuemin=${() => finite(this.min, 180)}
                aria-valuemax=${this.maximumSize}
                aria-valuenow=${this.currentSize}
                onpointerdown=${this.beginResize}
                ondblclick=${this.handleReset}
                onkeydown=${this.handleKey}
            ></div>`
    }
    protected syncView(): void {
        this.style.setProperty(
            '--component-resizable-panel-size',
            this.cssSize()
        )
        this.dataset.placement = this.placement === 'start' ? 'start' : 'end'
        this.dataset.variant = this.variant === 'plain' ? 'plain' : 'panel'
        this.handle?.setAttribute('aria-valuemax', String(this.maximumSize()))
        this.handle?.setAttribute('aria-valuenow', String(this.currentSize()))
        const viewportWidth =
            this.ownerDocument.defaultView?.innerWidth ??
            Number.POSITIVE_INFINITY
        this.toggleAttribute(
            'data-resize-collapsed',
            finite(this.collapseAt, 0) > 0 &&
                viewportWidth <= finite(this.collapseAt, 0)
        )
    }
    protected mount(): void {
        const view = this.ownerDocument.defaultView
        if (view) this.listen(view, 'resize', this.handleViewportResize)
        if (typeof ResizeObserver !== 'undefined' && this.parentElement) {
            const observer = new ResizeObserver(this.handleViewportResize)
            observer.observe(this.parentElement)
            this.cleanup(() => observer.disconnect())
        }
        super.mount()
    }
    private handleViewportResize = (): void => this.syncView()
    private handleReset = (event: Event): void => {
        this.reset(event)
    }
    private beginResize = (event: PointerEvent): void => {
        if (this.unavailable || !this.handle) return
        this.startX = event.clientX
        this.startSize = this.currentSize()
        this.handle.dataset.resizing = ''
        this.handle.setPointerCapture(event.pointerId)
        const move = (moveEvent: PointerEvent): void => {
            const direction = this.placement === 'start' ? 1 : -1
            this.resize(
                this.startSize + (moveEvent.clientX - this.startX) * direction,
                moveEvent
            )
        }
        const end = (endEvent: PointerEvent): void => {
            this.handle?.removeAttribute('data-resizing')
            this.handle?.releasePointerCapture(endEvent.pointerId)
            this.handle?.removeEventListener('pointermove', move)
            this.handle?.removeEventListener('pointerup', end)
            this.handle?.removeEventListener('pointercancel', end)
            this.finishResize(endEvent)
        }
        this.handle.addEventListener('pointermove', move)
        this.handle.addEventListener('pointerup', end)
        this.handle.addEventListener('pointercancel', end)
    }
    private handleKey = (event: KeyboardEvent): void => {
        const amount = event.shiftKey
            ? finite(this.step, 16) * 4
            : finite(this.step, 16)
        const direction = this.placement === 'start' ? 1 : -1
        let next: number | undefined
        if (event.key === 'ArrowLeft')
            next = this.currentSize() - amount * direction
        else if (event.key === 'ArrowRight')
            next = this.currentSize() + amount * direction
        else if (event.key === 'Home') {
            event.preventDefault()
            this.reset(event)
            return
        } else if (event.key === 'End') next = finite(this.max, 640)
        if (next === undefined) return
        event.preventDefault()
        if (this.resize(next, event)) this.finishResize(event)
    }
}
export { ResizablePanelBase }
export type {
    ResizablePanelProps,
    ResizablePanelValue,
} from './ResizablePanelBase.js'

register('cb-resizable-panel', ResizablePanel)
