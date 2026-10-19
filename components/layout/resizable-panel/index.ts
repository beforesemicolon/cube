import { type Template, html } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { finite, scalarText } from '../../core/value.js';
import { ResizablePanelBase } from './ResizablePanelBase.js';
const css = editorCSS + `
:host{position:relative;display:block;inline-size:var(--component-resizable-panel-size,320px);min-inline-size:0}
[part~=panel]{block-size:100%;overflow:auto;border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface)}
[part~=header]{padding:var(--spacing-md,12px);border-block-end:1px solid var(--color-separator);font-weight:650}
[part~=content]{display:block;padding:var(--spacing-md,12px)}
[part~=resize-handle]{position:absolute;z-index:1;inset-block:0;inset-inline-start:-5px;inline-size:10px;cursor:col-resize;touch-action:none}
:host([data-placement=start]) [part~=resize-handle]{inset-inline-start:auto;inset-inline-end:-5px}
[part~=resize-handle]::before{content:'';position:absolute;inset-block:0;inset-inline-start:4px;inline-size:2px;background:transparent;transition:background var(--motion-duration-fast,100ms)}
[part~=resize-handle]:hover::before,[part~=resize-handle]:focus-visible::before,[part~=resize-handle][data-resizing]::before{background:var(--color-primary)}
`;
export class ResizablePanel extends ResizablePanelBase {
    private get handle(): HTMLElement | undefined { const node = this.refs.handle?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private startX = 0;
    private startSize = 0;
    render(): Template {
        return html`<style part="styles">${css}</style><section part="panel" aria-label=${() => this.accessibleName()}>
            <header part="header"><slot name="heading" part="heading">${() => this.label}</slot></header>
            <slot part="content"></slot>
        </section><div part="resize-handle" ref="handle" role="separator" aria-orientation="vertical"
            tabindex=${() => this.unavailable ? -1 : 0} aria-label=${() => scalarText(this.resizeLabel)}
            aria-valuemin=${() => finite(this.min,180)} aria-valuemax=${() => finite(this.max,640)}
            aria-valuenow=${() => this.currentSize()}
            onpointerdown=${(event: PointerEvent) => this.beginResize(event)}
            onkeydown=${(event: KeyboardEvent) => this.handleKey(event)}></div>`;
    }
    protected syncView(): void {
        this.style.setProperty('--component-resizable-panel-size', `${this.currentSize()}px`);
        this.dataset.placement = this.placement === 'start' ? 'start' : 'end';
    }
    private beginResize(event: PointerEvent): void {
        if (this.unavailable || !this.handle)
            return;
        this.startX = event.clientX;
        this.startSize = this.currentSize();
        this.handle.dataset.resizing = '';
        this.handle.setPointerCapture(event.pointerId);
        const move = (moveEvent: PointerEvent): void => {
            const direction = this.placement === 'start' ? 1 : -1;
            this.resize(this.startSize + (moveEvent.clientX - this.startX) * direction, moveEvent);
        };
        const end = (endEvent: PointerEvent): void => {
            this.handle?.removeAttribute('data-resizing');
            this.handle?.releasePointerCapture(endEvent.pointerId);
            this.handle?.removeEventListener('pointermove', move);
            this.handle?.removeEventListener('pointerup', end);
            this.handle?.removeEventListener('pointercancel', end);
        };
        this.handle.addEventListener('pointermove', move);
        this.handle.addEventListener('pointerup', end);
        this.handle.addEventListener('pointercancel', end);
    }
    private handleKey(event: KeyboardEvent): void {
        const amount = event.shiftKey ? finite(this.step, 16) * 4 : finite(this.step, 16);
        const direction = this.placement === 'start' ? 1 : -1;
        let next: number | undefined;
        if (event.key === 'ArrowLeft')
            next = this.currentSize() - amount * direction;
        else if (event.key === 'ArrowRight')
            next = this.currentSize() + amount * direction;
        else if (event.key === 'Home')
            next = finite(this.min, 180);
        else if (event.key === 'End')
            next = finite(this.max, 640);
        if (next === undefined)
            return;
        event.preventDefault();
        this.resize(next, event);
    }
}
export { ResizablePanelBase };
export type { ResizablePanelProps } from './ResizablePanelBase.js';
