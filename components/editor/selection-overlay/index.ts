import componentStylesheet from './styles.css?inline'
import { isNot, type Template, html, repeat } from '../../core/runtime.js'

import { bool, finite, scalarText } from '../../core/value.js';
import { SelectionOverlayBase, type SelectionHandle } from './SelectionOverlayBase.js';

export class SelectionOverlay extends SelectionOverlayBase {
    stylesheet = componentStylesheet

    private get outline(): HTMLElement | undefined { const node=this.refs.outline?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private get rotateHandle(): HTMLElement | undefined { const node=this.refs.rotate?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private get handles(): Map<SelectionHandle, HTMLElement> {
        return new Map(this.allHandles().flatMap(handle => {
            const node = (this.refs.handles ?? []).find(node => node instanceof HTMLElement && node.dataset.handle === handle);
            return node instanceof HTMLElement ? [[handle,node] as const] : [];
        }));
    }
    render(): Template {
        return html`<div part="outline" ref="outline" role="group"
            tabindex=${() => this.unavailable || !bool(this.movable) ? -1 : 0}
            aria-label=${() => scalarText(this.moveLabel) || this.accessibleName()}
            onpointerdown=${this.beginMove} onkeydown=${this.moveKey}></div>
            ${repeat(this.allHandles, handle => html`<cb-button part=${`handle handle-${handle}`} ref="handles" data-handle=${handle} data-bare data-semantic-host
                hidden=${isNot(this.props.resizable)} disabled=${() => this.unavailable} accessible-label=${() => this.handleLabel(handle)}
                onbeforeaction=${(event: Event) => event.stopPropagation()}
                onaction=${(event: Event) => event.stopPropagation()}
                onpointerdown=${(event: PointerEvent) => { event.stopPropagation(); this.beginResize(handle,event); }}
                onkeydown=${(event: KeyboardEvent) => this.resizeKey(handle,event)}></cb-button>`, {key: handle => handle})}
            <cb-button part="rotate" exportparts="control:rotate-control,label:rotate-label,button-label:rotate-label,icon:rotate-icon,description:rotate-description" ref="rotate" data-bare data-semantic-host hidden=${isNot(this.props.rotatable)} disabled=${() => this.unavailable}
                accessible-label=${this.props.rotateLabel}
                onbeforeaction=${(event: Event) => event.stopPropagation()}
                onaction=${(event: Event) => event.stopPropagation()}
                onpointerdown=${(event: PointerEvent) => { event.stopPropagation(); this.beginRotate(event); }}
                onkeydown=${(event: KeyboardEvent) => {
                    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
                    event.preventDefault(); this.setRotation(finite(this.rotation)+(event.key === 'ArrowRight' ? 1 : -1)*this.normalizedStep(event.shiftKey ? 10 : 1),event);
                }}></cb-button>
            <span part="size" hidden=${isNot(this.props.showSize)}>${() => {
                const rect = this.currentRect();
                return scalarText(this.sizeLabel).replaceAll('{width}',String(Math.round(rect.width))).replaceAll('{height}',String(Math.round(rect.height)));
            }}</span>`;
    }
    protected syncView(): void {
        const rect=this.currentRect();
        Object.assign(this.style,{left:`${rect.x}px`,top:`${rect.y}px`,width:`${rect.width}px`,height:`${rect.height}px`,rotate:`${finite(this.rotation)}deg`});
    }
    private beginMove = (event: PointerEvent): void => {
        if (event.button !== 0 || !bool(this.movable) || this.unavailable || event.target !== this.outline || !this.outline)
            return;
        const startX = event.clientX, startY = event.clientY;
        this.outline.setPointerCapture(event.pointerId);
        let lastX = startX, lastY = startY;
        const move = (next: PointerEvent): void => { this.moveBy(next.clientX - lastX, next.clientY - lastY, next); lastX = next.clientX; lastY = next.clientY; };
        const end = (up: PointerEvent): void => { this.outline?.removeEventListener('pointermove', move); this.outline?.removeEventListener('pointerup', end); this.outline?.removeEventListener('pointercancel', end); if (this.outline?.hasPointerCapture(up.pointerId))
            this.outline.releasePointerCapture(up.pointerId); };
        this.outline.addEventListener('pointermove', move);
        this.outline.addEventListener('pointerup', end);
        this.outline.addEventListener('pointercancel', end);
    }
    private beginResize(handle: SelectionHandle, event: PointerEvent): void {
        const button = this.handles.get(handle);
        if (!button || event.button !== 0 || this.unavailable)
            return;
        let lastX = event.clientX, lastY = event.clientY;
        button.setPointerCapture(event.pointerId);
        const move = (next: PointerEvent): void => { this.resizeBy(handle, next.clientX - lastX, next.clientY - lastY, next); lastX = next.clientX; lastY = next.clientY; };
        const end = (up: PointerEvent): void => { button.removeEventListener('pointermove', move); button.removeEventListener('pointerup', end); button.removeEventListener('pointercancel', end); if (button.hasPointerCapture(up.pointerId))
            button.releasePointerCapture(up.pointerId); };
        button.addEventListener('pointermove', move);
        button.addEventListener('pointerup', end);
        button.addEventListener('pointercancel', end);
    }
    private beginRotate(event: PointerEvent): void {
        if (!this.rotateHandle || event.button !== 0 || this.unavailable)
            return;
        const button = this.rotateHandle;
        button.setPointerCapture(event.pointerId);
        const move = (next: PointerEvent): void => { const bounds = this.getBoundingClientRect(); const angle = Math.atan2(next.clientY - (bounds.top + bounds.height / 2), next.clientX - (bounds.left + bounds.width / 2)) * 180 / Math.PI + 90; this.setRotation(angle, next); };
        const end = (up: PointerEvent): void => { button.removeEventListener('pointermove', move); button.removeEventListener('pointerup', end); button.removeEventListener('pointercancel', end); if (button.hasPointerCapture(up.pointerId))
            button.releasePointerCapture(up.pointerId); };
        button.addEventListener('pointermove', move);
        button.addEventListener('pointerup', end);
        button.addEventListener('pointercancel', end);
    }
    private moveKey = (event: KeyboardEvent): void => {
        const step = this.normalizedStep(event.shiftKey ? 10 : 1);
        let dx = 0, dy = 0;
        if (event.key === 'ArrowLeft')
            dx = -step;
        else if (event.key === 'ArrowRight')
            dx = step;
        else if (event.key === 'ArrowUp')
            dy = -step;
        else if (event.key === 'ArrowDown')
            dy = step;
        else
            return;
        event.preventDefault();
        this.moveBy(dx, dy, event);
    }
    private resizeKey(handle: SelectionHandle, event: KeyboardEvent): void {
        const step = this.normalizedStep(event.shiftKey ? 10 : 1);
        let dx = 0, dy = 0;
        if (event.key === 'ArrowLeft')
            dx = -step;
        else if (event.key === 'ArrowRight')
            dx = step;
        else if (event.key === 'ArrowUp')
            dy = -step;
        else if (event.key === 'ArrowDown')
            dy = step;
        else
            return;
        event.preventDefault();
        this.resizeBy(handle, dx, dy, event);
    }
}
export { SelectionOverlayBase };
export type { SelectionOverlayProps, EditorRect, SelectionHandle } from './SelectionOverlayBase.js';
