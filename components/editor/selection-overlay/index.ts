import { type Template, html, repeat } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { bool, finite, scalarText } from '../../core/value.js';
import { SelectionOverlayBase, type SelectionHandle } from './SelectionOverlayBase.js';
const css = editorCSS + `
:host{position:absolute;z-index:var(--z-index-selection,20);display:block;box-sizing:border-box;pointer-events:none;transform-origin:center}
[part~=outline]{position:absolute;inset:0;border:var(--component-selection-width,1px) solid var(--color-primary);background:color-mix(in srgb,var(--color-selection) 16%,transparent);pointer-events:auto;cursor:move}
[part~=outline]:focus-visible{outline:var(--focus-ring);outline-offset:2px}
[part~=handle]{position:absolute;display:block;inline-size:var(--component-selection-handle-size,9px);min-inline-size:0;block-size:var(--component-selection-handle-size,9px);min-block-size:0;padding:0;border:1px solid var(--color-primary);border-radius:2px;background:var(--color-surface);pointer-events:auto;translate:-50% -50%}
[part~=handle]::part(control),[part~=rotate]::part(control){inline-size:100%;block-size:100%;cursor:inherit}
[part~=handle][data-handle=nw]{inset:0 auto auto 0;cursor:nwse-resize}[part~=handle][data-handle=n]{inset:0 auto auto 50%;cursor:ns-resize}[part~=handle][data-handle=ne]{inset:0 0 auto auto;translate:50% -50%;cursor:nesw-resize}
[part~=handle][data-handle=e]{inset:50% 0 auto auto;translate:50% -50%;cursor:ew-resize}[part~=handle][data-handle=se]{inset:auto 0 0 auto;translate:50% 50%;cursor:nwse-resize}[part~=handle][data-handle=s]{inset:auto auto 0 50%;translate:-50% 50%;cursor:ns-resize}
[part~=handle][data-handle=sw]{inset:auto auto 0 0;translate:-50% 50%;cursor:nesw-resize}[part~=handle][data-handle=w]{inset:50% auto auto 0;cursor:ew-resize}
[part~=rotate]{position:absolute;inset:-28px auto auto 50%;display:block;inline-size:18px;min-inline-size:18px;block-size:18px;min-block-size:18px;padding:0;border:1px solid var(--color-primary);border-radius:50%;background:var(--color-surface);pointer-events:auto;translate:-50% 0;cursor:grab}
[part~=rotate]::after{content:'';position:absolute;inset-block-end:-11px;inset-inline-start:50%;block-size:10px;border-inline-start:1px solid var(--color-primary)}
[part~=size]{position:absolute;inset:auto auto -26px 50%;translate:-50% 0;padding:2px 5px;border-radius:3px;background:var(--color-primary);color:var(--color-primary-foreground);font:600 10px/1.4 var(--typography-mono-font-family);white-space:nowrap;pointer-events:none}
:host([data-disabled]) [part~=outline]{cursor:default}:host([data-disabled]) [part~=handle],:host([data-disabled]) [part~=rotate]{display:none}
`;
export class SelectionOverlay extends SelectionOverlayBase {
    private get outline(): HTMLElement | undefined { const node=this.refs.outline?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private get rotateHandle(): HTMLElement | undefined { const node=this.refs.rotate?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private get handles(): Map<SelectionHandle, HTMLElement> {
        return new Map(this.allHandles().flatMap(handle => {
            const node = (this.refs.handles ?? []).find(node => node instanceof HTMLElement && node.dataset.handle === handle);
            return node instanceof HTMLElement ? [[handle,node] as const] : [];
        }));
    }
    render(): Template {
        return html`<style part="styles">${css}</style><div part="outline" ref="outline" role="group"
            tabindex=${() => this.unavailable || !bool(this.movable) ? -1 : 0}
            aria-label=${() => scalarText(this.moveLabel) || this.accessibleName()}
            onpointerdown=${(event: PointerEvent) => this.beginMove(event)} onkeydown=${(event: KeyboardEvent) => this.moveKey(event)}></div>
            ${repeat(() => this.allHandles(), handle => html`<cb-button part=${`handle handle-${handle}`} ref="handles" data-handle=${handle} data-bare data-semantic-host
                hidden=${() => !bool(this.resizable)} disabled=${() => this.unavailable} accessible-label=${() => this.handleLabel(handle)}
                onpointerdown=${(event: PointerEvent) => { event.stopPropagation(); this.beginResize(handle,event); }}
                onkeydown=${(event: KeyboardEvent) => this.resizeKey(handle,event)}></cb-button>`, {key: handle => handle})}
            <cb-button part="rotate" exportparts="control:rotate-control,label:rotate-label,button-label:rotate-label,icon:rotate-icon,description:rotate-description" ref="rotate" data-bare data-semantic-host hidden=${() => !bool(this.rotatable)} disabled=${() => this.unavailable}
                accessible-label=${() => scalarText(this.rotateLabel)}
                onpointerdown=${(event: PointerEvent) => { event.stopPropagation(); this.beginRotate(event); }}
                onkeydown=${(event: KeyboardEvent) => {
                    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
                    event.preventDefault(); this.setRotation(finite(this.rotation)+(event.key === 'ArrowRight' ? 1 : -1)*this.normalizedStep(event.shiftKey ? 10 : 1),event);
                }}></cb-button>
            <span part="size" hidden=${() => !bool(this.showSize)}>${() => {
                const rect = this.currentRect();
                return scalarText(this.sizeLabel).replaceAll('{width}',String(Math.round(rect.width))).replaceAll('{height}',String(Math.round(rect.height)));
            }}</span>`;
    }
    protected syncView(): void {
        const rect=this.currentRect();
        Object.assign(this.style,{left:`${rect.x}px`,top:`${rect.y}px`,width:`${rect.width}px`,height:`${rect.height}px`,rotate:`${finite(this.rotation)}deg`});
    }
    private beginMove(event: PointerEvent): void {
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
    private moveKey(event: KeyboardEvent): void {
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
