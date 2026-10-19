import { type Template, html, state } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import type { EditorRect } from '../selection-overlay/SelectionOverlayBase.js';
import { MarqueeSelectionBase } from './MarqueeSelectionBase.js';
const css = editorCSS + `
:host{position:absolute;z-index:var(--z-index-marquee,10);inset:0;display:block;cursor:crosshair;touch-action:none}
[part~=marquee]{position:absolute;border:1px solid var(--color-primary);background:color-mix(in srgb,var(--color-selection) 42%,transparent);pointer-events:none}
`;
export class MarqueeSelection extends MarqueeSelectionBase {
    private readonly rectangle = state<EditorRect | null>(null);
    render(): Template {
        return html`<style part="styles">${css}</style><div part="marquee"
            hidden=${() => !this.rectangle[0]()} style=${() => {
                const rect = this.rectangle[0]();
                return rect ? `left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px` : '';
            }}></div>`;
    }
    protected mount(): void {
        this.listen(this, 'pointerdown', event => { if (event instanceof PointerEvent) this.pointerStart(event); });
        this.listen(this, 'keydown', event => { if (event instanceof KeyboardEvent && event.key === 'Escape') this.cancel(event); });
    }
    protected syncMarquee(rect?: EditorRect): void { this.rectangle[1](rect ?? null); }
    private pointerStart(event: PointerEvent): void {
        if (event.button !== 0 || event.target !== this)
            return;
        const frame = this.getBoundingClientRect();
        if (!this.begin({ x: event.clientX - frame.left, y: event.clientY - frame.top }, event.metaKey || event.ctrlKey, event))
            return;
        this.setPointerCapture(event.pointerId);
        const move = (next: PointerEvent): void => this.updateSelection({ x: next.clientX - frame.left, y: next.clientY - frame.top }, next);
        const end = (up: PointerEvent): void => { this.removeEventListener('pointermove', move); this.removeEventListener('pointerup', end); this.removeEventListener('pointercancel', cancel); if (this.hasPointerCapture(up.pointerId))
            this.releasePointerCapture(up.pointerId); this.finish(up); };
        const cancel = (cancelEvent: PointerEvent): void => { this.removeEventListener('pointermove', move); this.removeEventListener('pointerup', end); this.removeEventListener('pointercancel', cancel); this.cancel(cancelEvent); };
        this.addEventListener('pointermove', move);
        this.addEventListener('pointerup', end);
        this.addEventListener('pointercancel', cancel);
    }
}
export { MarqueeSelectionBase };
export type { MarqueeSelectionProps, MarqueeTarget, EditorPoint } from './MarqueeSelectionBase.js';
