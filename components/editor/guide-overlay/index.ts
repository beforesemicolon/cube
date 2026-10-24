import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { is, type Template, html, repeat, when, state } from '../../core/runtime.js'

import { finite } from '../../core/value.js';
import { GuideOverlayBase, type EditorGuide } from './GuideOverlayBase.js';
import { compactGuideLabel, visibleLabelBounds } from './labels.js'

interface LabelLayout { left: number; top: number; maxWidth: number; maxHeight: number; scaleX: number; scaleY: number }

export class GuideOverlay extends GuideOverlayBase {
    stylesheet = componentStylesheet
    private layouts = state<Readonly<Record<string, LabelLayout>>>({})
    private frame?: number

    protected mount(): void {
        super.mount()
        this.cleanup(() => {
            if (this.frame !== undefined) this.ownerDocument.defaultView?.cancelAnimationFrame(this.frame)
            this.frame = undefined
        })
    }
    protected syncView(): void { this.refreshLabels() }
    private refreshLabels = (): void => {
        const view = this.ownerDocument.defaultView
        if (view && this.frame === undefined) this.frame = view.requestAnimationFrame(this.placeLabels)
    }
    private placeLabels = (): void => {
        this.frame = undefined
        if (!this.isConnected) return
        const guides = this.normalizedGuides().filter(guide => guide.label)
        if (!guides.length) return
        // Transforms, panning and ancestor scrolling do not resize this overlay.
        // Keep reading geometry while labels exist; rendering stays declarative.
        this.refreshLabels()
        const bounds = visibleLabelBounds(this), rect = this.getBoundingClientRect()
        const next: Record<string, LabelLayout> = {}
        if (this.getClientRects().length && bounds.right > bounds.left && bounds.bottom > bounds.top && this.offsetWidth && this.offsetHeight) {
            const scaleX = rect.width / this.offsetWidth, scaleY = rect.height / this.offsetHeight
            const zoom = Math.max(.01, finite(this.zoom, 1))
            const labels = new Map((this.refs.labels ?? []).flatMap(node => node instanceof HTMLElement ? [[node.dataset.guideLabelId, node] as const] : []))
            const lines = new Map((this.refs.lines ?? []).flatMap(node => node instanceof HTMLElement ? [[node.dataset.id, node] as const] : []))
            for (const guide of guides) {
                const label = labels.get(guide.id)
                const line = lines.get(guide.id)?.getBoundingClientRect()
                // A label belongs to this artboard's visible line, never to a
                // screen edge when that line has panned/scrolled out of view.
                if (!label || !line || line.right <= bounds.left || line.left >= bounds.right || line.bottom <= bounds.top || line.top >= bounds.bottom) continue
                // Labels are inverse-scaled, so their CSS dimensions are screen pixels.
                const width = Math.min(label.offsetWidth, bounds.right - bounds.left), height = Math.min(label.offsetHeight, bounds.bottom - bounds.top)
                const start = finite(guide.start), end = finite(guide.end)
                const offset = end > start ? (start + end) / 2 : start
                const x = rect.left + (guide.axis === 'x' ? offset : guide.position) * zoom * scaleX
                const y = rect.top + (guide.axis === 'x' ? guide.position : offset) * zoom * scaleY
                next[guide.id] = {
                    left: (Math.max(bounds.left, Math.min(x - width / 2, bounds.right - width)) - rect.left) / scaleX,
                    top: (Math.max(bounds.top, Math.min(y - height / 2, bounds.bottom - height)) - rect.top) / scaleY,
                    maxWidth: bounds.right - bounds.left,
                    maxHeight: bounds.bottom - bounds.top,
                    scaleX: 1 / scaleX,
                    scaleY: 1 / scaleY,
                }
            }
        }
        const previous = this.layouts[0]()
        if (Object.keys(previous).length !== Object.keys(next).length || Object.entries(next).some(([id, layout]) =>
            !previous[id] || Object.entries(layout).some(([key, value]) => Math.abs(previous[id][key as keyof LabelLayout] - value) > .01))) this.layouts[1](next)
    }
    private labelStyle = (guide: EditorGuide): string => {
        const layout = this.layouts[0]()[guide.id]
        return layout ? `left:${layout.left}px;top:${layout.top}px;max-width:${layout.maxWidth}px;max-height:${layout.maxHeight}px;scale:${layout.scaleX} ${layout.scaleY}`
            : 'visibility:hidden'
    }

    render(): Template {
        return html`<div part="guides">
            ${repeat(this.normalizedGuides, guide => html`
                <span part=${() => `line ${guide.type}-guide`} ref="lines" data-axis=${() => guide.axis}
                    data-type=${() => guide.type ?? 'snap'} data-id=${() => guide.id}
                    style=${() => this.guideStyle(guide)}></span>
                ${when(is(guide.label), () => html`<span part="label" ref="labels" data-guide-label-id=${guide.id}
                    style=${() => this.labelStyle(guide)}>${() => compactGuideLabel(guide.label || '')}</span>`)}
            `, { key: guide => guide.id })}
        </div>`;
    }
    private guideStyle(guide: EditorGuide): string {
        const scale = Math.max(.01, finite(this.zoom, 1));
        const start = finite(guide.start) * scale, end = finite(guide.end) * scale;
        const position = guide.position * scale;
        return guide.axis === 'x'
            ? `inset-inline-start:${start}px;inset-block-start:${position}px;inline-size:${end > start ? `${end - start}px` : '100%'}`
            : `inset-block-start:${start}px;inset-inline-start:${position}px;block-size:${end > start ? `${end - start}px` : '100%'}`;
    }
}
export { GuideOverlayBase };
export type { GuideOverlayProps, EditorGuide, EditorGuideType } from './GuideOverlayBase.js';

register('cb-guide-overlay', GuideOverlay)
