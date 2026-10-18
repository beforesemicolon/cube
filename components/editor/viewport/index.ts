import { actionLabel, createIconButton } from '../../action/create.js'
import type { IconButton } from '../../action/icon-button/index.js'
import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { finite } from '../../core/value.js'
import { token as v } from '../../theme/tokens.js'
import { ViewportBase } from './ViewportBase.js'

const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0;container-type:inline-size}
[part~=viewport]{position:relative;isolation:isolate;overflow:hidden;min-block-size:var(--component-viewport-height,420px);border:1px solid ${v('--color-border')};border-radius:var(--radius-lg,12px);background:${v('--color-surface-muted')};touch-action:none;user-select:none}
[part~=viewport][data-grid]{background-image:linear-gradient(${v('--color-separator')} 1px,transparent 1px),linear-gradient(90deg,${v('--color-separator')} 1px,transparent 1px);background-size:var(--component-viewport-grid-size,20px) var(--component-viewport-grid-size,20px)}
[part~=world]{position:absolute;inset-block-start:50%;inset-inline-start:50%;transform:translate(-50%,-50%) translate(var(--cb-pan-x),var(--cb-pan-y)) scale(var(--cb-zoom));transform-origin:center;will-change:transform}
[part~=controls]{position:absolute;z-index:2;inset-inline-end:var(--spacing-sm,8px);inset-block-end:var(--spacing-sm,8px);display:flex;align-items:center;gap:2px;padding:2px;border:1px solid ${v('--color-separator')};border-radius:var(--radius-md,10px);background:color-mix(in srgb,${v('--color-surface-raised')} 92%,transparent);box-shadow:0 4px 16px color-mix(in srgb,${v('--color-foreground')} 12%,transparent)}
[part~=zoom-out],[part~=reset],[part~=zoom-in]{--component-control-height-sm:30px}
[part~=status]{min-inline-size:58px;text-align:center;font-variant-numeric:tabular-nums;color:${v('--color-muted-foreground')};pointer-events:none}
[part~=position]{position:absolute;z-index:2;inset-inline-start:var(--spacing-sm,8px);inset-block-end:var(--spacing-sm,8px);margin:0;padding:3px 6px;border-radius:var(--radius-sm,6px);background:color-mix(in srgb,${v('--color-surface-raised')} 88%,transparent);color:${v('--color-muted-foreground')};font:var(--component-code-font,11px/1.4 ui-monospace,monospace);font-variant-numeric:tabular-nums;pointer-events:none}
:host([data-disabled]) [part~=viewport]{opacity:var(--component-disabled-opacity,.5);cursor:not-allowed}
@container(max-width:420px){[part~=viewport]{min-block-size:300px}[part~=position]{display:none}}
`

interface PanState { readonly pointerId: number; readonly startX: number; readonly startY: number; readonly originX: number; readonly originY: number; moved: boolean }

export class Viewport extends ViewportBase {
    private surface?: HTMLElement
    private world?: HTMLElement
    private controlsNode?: HTMLElement
    private status?: HTMLOutputElement
    private position?: HTMLOutputElement
    private zoomIn?: IconButton
    private zoomOut?: IconButton
    private resetButton?: IconButton
    private pan?: PanState

    render(): Node {
        this.surface = el('div', 'viewport canvas control')
        this.surface.tabIndex = 0
        this.surface.setAttribute('role', 'region')
        this.world = el('div', 'world')
        const content = el('slot', 'content')
        this.world.append(content)
        this.controlsNode = el('div', 'controls')
        this.zoomOut = createIconButton('zoom-out', 'minus', event => this.zoomBy(-Math.abs(finite(this.zoomStep, 10)), event))
        this.resetButton = createIconButton('reset', 'reset', event => this.reset(event))
        this.status = el('output', 'status')
        this.zoomIn = createIconButton('zoom-in', 'plus', event => this.zoomBy(Math.abs(finite(this.zoomStep, 10)), event))
        this.controlsNode.append(this.zoomOut, this.resetButton, this.status, this.zoomIn)
        this.position = el('output', 'position')
        this.surface.append(this.world, this.controlsNode, this.position)
        this.surface.addEventListener('wheel', event => {
            if (this.unavailable) return
            event.preventDefault()
            if (event.ctrlKey || event.metaKey) this.zoomBy(event.deltaY < 0 ? Math.abs(finite(this.zoomStep, 10)) : -Math.abs(finite(this.zoomStep, 10)), event, false)
            else this.panBy(-event.deltaX, -event.deltaY, event, false)
        }, { passive: false })
        this.surface.addEventListener('pointerdown', event => this.beginPan(event))
        this.surface.addEventListener('pointermove', event => this.movePan(event))
        this.surface.addEventListener('pointerup', event => this.endPan(event))
        this.surface.addEventListener('pointercancel', event => this.endPan(event))
        this.surface.addEventListener('keydown', event => this.onKeydown(event))
        return fragment(sheet(css), this.surface)
    }

    protected syncView(): void {
        if (!this.surface || !this.world || !this.controlsNode || !this.status || !this.position || !this.zoomIn || !this.zoomOut || !this.resetButton) return
        const state = this.viewportState()
        this.world.style.setProperty('--cb-zoom', String(state.zoom / 100))
        this.world.style.setProperty('--cb-pan-x', `${state.x}px`)
        this.world.style.setProperty('--cb-pan-y', `${state.y}px`)
        this.surface.toggleAttribute('data-grid', this.gridVisible())
        this.surface.tabIndex = this.unavailable ? -1 : 0
        aria(this.surface, 'aria-label', this.accessibleName())
        aria(this.surface, 'aria-disabled', this.unavailable ? true : null)
        this.controlsNode.hidden = !this.controlsVisible()
        this.status.value = `${Math.round(state.zoom)}%`
        this.position.value = this.text('positionLabel').replace('{x}', String(Math.round(state.x))).replace('{y}', String(Math.round(state.y)))
        this.position.hidden = !this.position.value
        actionLabel(this.zoomIn, this.text('zoomInLabel'))
        actionLabel(this.zoomOut, this.text('zoomOutLabel'))
        actionLabel(this.resetButton, this.text('resetLabel'))
        this.zoomIn.disabled = this.unavailable || state.zoom >= this.normalizedZoom(this.maxZoom)
        this.zoomOut.disabled = this.unavailable || state.zoom <= this.normalizedZoom(this.minZoom)
        this.resetButton.disabled = this.unavailable
    }

    private beginPan(event: PointerEvent): void {
        if (!this.surface || !this.canPan() || event.button !== 0) return
        const interactive = event.composedPath().some(node => node instanceof HTMLElement && (node.matches('button,input,select,textarea,a') || node.localName.startsWith('cb-') && node !== this))
        if (interactive) return
        this.pan = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: finite(this.x), originY: finite(this.y), moved: false }
        this.surface.setPointerCapture(event.pointerId)
        this.surface.toggleAttribute('data-panning', true)
    }

    private movePan(event: PointerEvent): void {
        if (!this.pan || event.pointerId !== this.pan.pointerId) return
        const x = this.pan.originX + event.clientX - this.pan.startX
        const y = this.pan.originY + event.clientY - this.pan.startY
        this.pan.moved = this.pan.moved || Math.abs(x - this.pan.originX) > 1 || Math.abs(y - this.pan.originY) > 1
        this.setViewport(this.normalizedZoom(), x, y, event, false)
    }

    private endPan(event: PointerEvent): void {
        if (!this.pan || event.pointerId !== this.pan.pointerId) return
        const pan = this.pan
        this.pan = undefined
        this.surface?.toggleAttribute('data-panning', false)
        if (pan.moved) this.setViewport(this.normalizedZoom(), finite(this.x), finite(this.y), event)
    }

    private onKeydown(event: KeyboardEvent): void {
        const amount = event.shiftKey ? 20 : 5
        const direction: Readonly<Record<string, readonly [number, number]>> = { ArrowLeft:[-amount,0], ArrowRight:[amount,0], ArrowUp:[0,-amount], ArrowDown:[0,amount] }
        const delta = direction[event.key]
        if (delta && this.canPan()) { event.preventDefault(); this.panBy(delta[0], delta[1], event) }
        else if ((event.key === '+' || event.key === '=') && !this.unavailable) { event.preventDefault(); this.zoomBy(Math.abs(finite(this.zoomStep, 10)), event) }
        else if (event.key === '-' && !this.unavailable) { event.preventDefault(); this.zoomBy(-Math.abs(finite(this.zoomStep, 10)), event) }
        else if (event.key === '0' && !this.unavailable) { event.preventDefault(); this.reset(event) }
    }
}

register('cb-viewport', Viewport)
export { ViewportBase }
export type { ViewportProps } from './ViewportBase.js'
