import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import type { EditorRect } from '../selection-overlay/SelectionOverlayBase.js'
import { MarqueeSelectionBase } from './MarqueeSelectionBase.js'

const css = editorCSS + `
:host{position:absolute;z-index:var(--z-index-marquee,10);inset:0;display:block;cursor:crosshair;touch-action:none}
[part~=marquee]{position:absolute;border:1px solid var(--color-primary);background:color-mix(in srgb,var(--color-selection) 42%,transparent);pointer-events:none}
`
export class MarqueeSelection extends MarqueeSelectionBase {
    private marquee?: HTMLElement
    render(): Node {
        this.marquee = el('div', 'marquee'); this.marquee.hidden = true
        this.addEventListener('pointerdown', event => this.pointerStart(event))
        this.addEventListener('keydown', event => { if (event.key === 'Escape') this.cancel(event) })
        return fragment(sheet(css), this.marquee)
    }
    protected syncMarquee(rect?: EditorRect): void {
        if (!this.marquee) return
        this.marquee.hidden = !rect
        if (rect) Object.assign(this.marquee.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px` })
    }
    private pointerStart(event: PointerEvent): void {
        if (event.button !== 0 || event.target !== this) return
        const frame = this.getBoundingClientRect()
        if (!this.begin({ x: event.clientX - frame.left, y: event.clientY - frame.top }, event.metaKey || event.ctrlKey, event)) return
        this.setPointerCapture(event.pointerId)
        const move = (next: PointerEvent): void => this.updateSelection({ x: next.clientX - frame.left, y: next.clientY - frame.top }, next)
        const end = (up: PointerEvent): void => { this.removeEventListener('pointermove', move); this.removeEventListener('pointerup', end); this.removeEventListener('pointercancel', cancel); if (this.hasPointerCapture(up.pointerId)) this.releasePointerCapture(up.pointerId); this.finish(up) }
        const cancel = (cancelEvent: PointerEvent): void => { this.removeEventListener('pointermove', move); this.removeEventListener('pointerup', end); this.removeEventListener('pointercancel', cancel); this.cancel(cancelEvent) }
        this.addEventListener('pointermove', move); this.addEventListener('pointerup', end); this.addEventListener('pointercancel', cancel)
    }
}
register('cb-marquee-selection', MarqueeSelection)
export { MarqueeSelectionBase }
export type { MarqueeSelectionProps, MarqueeTarget, EditorPoint } from './MarqueeSelectionBase.js'
