import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, type Template, html, state } from '../../core/runtime.js'

import type { EditorRect } from '../selection-overlay/SelectionOverlayBase.js';
import { MarqueeSelectionBase } from './MarqueeSelectionBase.js';

export class MarqueeSelection extends MarqueeSelectionBase {
    stylesheet = componentStylesheet

    private readonly rectangle = state<EditorRect | null>(null);
    render(): Template {
        return html`<div part="marquee selection"
            hidden=${isNot(this.rectangle[0])} style=${() => {
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

register('cb-marquee-selection', MarqueeSelection)
