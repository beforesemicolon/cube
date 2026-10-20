import componentStylesheet from './styles.css?inline'
import { isNot, or, type Template, html } from '../../core/runtime.js'

import { finite } from '../../core/value.js';

import { ViewportBase } from './ViewportBase.js';

interface PanState {
    readonly pointerId: number;
    readonly startX: number;
    readonly startY: number;
    readonly originX: number;
    readonly originY: number;
    moved: boolean;
}
export class Viewport extends ViewportBase {
    stylesheet = componentStylesheet

    private get surface(): HTMLElement | undefined { const node=this.refs.surface?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private pan?: PanState;
    render(): Template {
        return html`<div part="viewport canvas control" ref="surface" role="region"
            tabindex=${() => this.unavailable ? -1 : 0} aria-label=${this.accessibleName}
            aria-disabled=${() => this.unavailable || null} data-grid=${() => this.gridVisible() ? '' : null}
            onwheel=${(event: WheelEvent) => {
                if(this.unavailable) return;
                event.preventDefault();
                if(event.ctrlKey || event.metaKey) this.zoomBy((event.deltaY < 0 ? 1 : -1)*Math.abs(finite(this.zoomStep,10)),event,false);
                else this.panBy(-event.deltaX,-event.deltaY,event,false);
            }}
            onpointerdown=${this.beginPan}
            onpointermove=${this.movePan}
            onpointerup=${this.endPan}
            onpointercancel=${this.endPan}
            onkeydown=${this.onKeydown}>
            <div part="world" style=${() => { const value=this.viewportState(); return `--cb-zoom:${value.zoom/100};--cb-pan-x:${value.x}px;--cb-pan-y:${value.y}px`; }}><slot part="content"></slot></div>
            <div part="controls" hidden=${isNot(this.controlsVisible)}>
                <cb-button part="zoom-out" exportparts="control:zoom-out-control,label:zoom-out-label,button-label:zoom-out-label,icon:zoom-out-icon,description:zoom-out-description" icon-only icon="minus" variant="ghost" accessible-label=${() => this.text('zoomOutLabel')}
                    disabled=${or(() => this.unavailable, () => this.viewportState().zoom <= this.normalizedZoom(this.minZoom))}
                    onaction=${(event: Event) => { event.stopPropagation(); this.zoomBy(-Math.abs(finite(this.zoomStep,10)),event); }}></cb-button>
                <cb-button part="reset" exportparts="control:reset-control,label:reset-label,button-label:reset-label,icon:reset-icon,description:reset-description" icon-only icon="reset" variant="ghost" accessible-label=${() => this.text('resetLabel')} disabled=${() => this.unavailable}
                    onaction=${(event: Event) => { event.stopPropagation(); this.reset(event); }}></cb-button>
                <output part="status">${() => `${Math.round(this.viewportState().zoom)}%`}</output>
                <cb-button part="zoom-in" exportparts="control:zoom-in-control,label:zoom-in-label,button-label:zoom-in-label,icon:zoom-in-icon,description:zoom-in-description" icon-only icon="plus" variant="ghost" accessible-label=${() => this.text('zoomInLabel')}
                    disabled=${or(() => this.unavailable, () => this.viewportState().zoom >= this.normalizedZoom(this.maxZoom))}
                    onaction=${(event: Event) => { event.stopPropagation(); this.zoomBy(Math.abs(finite(this.zoomStep,10)),event); }}></cb-button>
            </div><output part="position" hidden=${isNot(this.positionText)}>${this.positionText}</output>
        </div>`;
    }
    private positionText = (): string => {
        const value=this.viewportState();
        return this.text('positionLabel').replace('{x}',String(Math.round(value.x))).replace('{y}',String(Math.round(value.y)));
    }
    private beginPan = (event: PointerEvent): void => {
        if (!this.surface || !this.canPan() || event.button !== 0)
            return;
        const interactive = event.composedPath().some(node => node instanceof HTMLElement && (node.matches('button,input,select,textarea,a') || node.localName.startsWith('cb-') && node !== this));
        if (interactive)
            return;
        this.pan = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: finite(this.x), originY: finite(this.y), moved: false };
        this.surface.setPointerCapture(event.pointerId);
        this.surface.toggleAttribute('data-panning', true);
    }
    private movePan = (event: PointerEvent): void => {
        if (!this.pan || event.pointerId !== this.pan.pointerId)
            return;
        const x = this.pan.originX + event.clientX - this.pan.startX;
        const y = this.pan.originY + event.clientY - this.pan.startY;
        this.pan.moved = this.pan.moved || Math.abs(x - this.pan.originX) > 1 || Math.abs(y - this.pan.originY) > 1;
        this.setViewport(this.normalizedZoom(), x, y, event, false);
    }
    private endPan = (event: PointerEvent): void => {
        if (!this.pan || event.pointerId !== this.pan.pointerId)
            return;
        const pan = this.pan;
        this.pan = undefined;
        this.surface?.toggleAttribute('data-panning', false);
        if (pan.moved)
            this.setViewport(this.normalizedZoom(), finite(this.x), finite(this.y), event);
    }
    private onKeydown = (event: KeyboardEvent): void => {
        const amount = event.shiftKey ? 20 : 5;
        const direction: Readonly<Record<string, readonly [
            number,
            number
        ]>> = { ArrowLeft: [-amount, 0], ArrowRight: [amount, 0], ArrowUp: [0, -amount], ArrowDown: [0, amount] };
        const delta = direction[event.key];
        if (delta && this.canPan()) {
            event.preventDefault();
            this.panBy(delta[0], delta[1], event);
        }
        else if ((event.key === '+' || event.key === '=') && !this.unavailable) {
            event.preventDefault();
            this.zoomBy(Math.abs(finite(this.zoomStep, 10)), event);
        }
        else if (event.key === '-' && !this.unavailable) {
            event.preventDefault();
            this.zoomBy(-Math.abs(finite(this.zoomStep, 10)), event);
        }
        else if (event.key === '0' && !this.unavailable) {
            event.preventDefault();
            this.reset(event);
        }
    }
}
export { ViewportBase };
export type { ViewportProps } from './ViewportBase.js';
