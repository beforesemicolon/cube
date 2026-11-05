import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, or, repeat, state, when, type Template, html } from '../../core/runtime.js'

import { finite } from '../../core/value.js';

import { ViewportBase, type ViewportActionPosition } from './ViewportBase.js';

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
    private readonly hasTopCenterContent = state(false)
    private topCenterSlotChange = (event: Event): void => {
        const slot = event.target
        if (slot instanceof HTMLSlotElement) this.hasTopCenterContent[1](slot.assignedNodes({ flatten: true }).some(node => node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim())))
    }

    render(): Template {
        return html`<div part="viewport canvas" ref="surface" role="region"
            tabindex=${() => this.unavailable ? -1 : 0} aria-label=${this.accessibleName}
            aria-disabled=${() => this.unavailable || null} data-grid=${() => this.gridVisible() ? '' : null}
            data-pan-tool=${() => this.panToolActive() ? '' : null}
            onwheel=${this.onWheel}
            onpointerdown=${this.beginPan}
            onpointermove=${this.movePan}
            onpointerup=${this.endPan}
            onpointercancel=${this.endPan}
            onkeydown=${this.onKeydown}>
            <div part="world" style=${() => { const value=this.viewportState(); return `--cb-zoom:${value.zoom/100};--cb-pan-x:${value.x}px;--cb-pan-y:${value.y}px`; }}><slot part="content"></slot></div>
            ${when(this.panToolActive, html`<div part="pan-surface" aria-hidden="true"></div>`)}
            <div part="top-center" hidden=${isNot(this.hasTopCenterContent[0])}
                onpointerdown=${this.containEvent} onkeydown=${this.containEvent} onwheel=${this.containEvent}>
                <slot name="top-center" onslotchange=${this.topCenterSlotChange}></slot>
            </div>
            ${repeat(['top-left', 'top-right'] as const, position => html`
                <div part=${`actions ${position}`} hidden=${() => !this.actionsAt(position).length}
                    onpointerdown=${this.containEvent} onkeydown=${this.containEvent}>
                    ${this.actionButtons(position)}
                </div>`)}
            <div part="controls" hidden=${() => !this.controlsVisible() && !this.actionsAt('bottom-right').length}
                onpointerdown=${this.containEvent} onkeydown=${this.containEvent}>
                ${this.actionButtons('bottom-right')}
                ${when(this.controlsVisible, html`
                <cb-button part="zoom-out" exportparts="control:zoom-out-control,label:zoom-out-label,button-label:zoom-out-label,icon:zoom-out-icon,description:zoom-out-description" icon-only icon="minus" variant="ghost" accessible-label=${() => this.text('zoomOutLabel')}
                    title=${() => `${this.text('zoomOutLabel')}${this.zoomOutShortcut ? ` (${this.zoomOutShortcut})` : ''}`}
                    data-shortcut=${this.props.zoomOutShortcut}
                    disabled=${or(() => this.unavailable, () => this.viewportState().zoom <= this.normalizedZoom(this.minZoom))}
                    onaction=${(event: Event) => { event.stopPropagation(); this.zoomBy(-Math.abs(finite(this.zoomStep,10)),event); }}></cb-button>
                <cb-button part="reset" exportparts="control:reset-control,label:reset-label,button-label:reset-label,icon:reset-icon,description:reset-description" icon-only icon="reset" variant="ghost" accessible-label=${() => this.text('resetLabel')} disabled=${() => this.unavailable}
                    title=${() => `${this.text('resetLabel')}${this.resetShortcut ? ` (${this.resetShortcut})` : ''}`}
                    data-shortcut=${this.props.resetShortcut}
                    onaction=${(event: Event) => { event.stopPropagation(); this.reset(event); }}></cb-button>
                <output part="status">${() => `${Math.round(this.viewportState().zoom)}%`}</output>
                <cb-button part="zoom-in" exportparts="control:zoom-in-control,label:zoom-in-label,button-label:zoom-in-label,icon:zoom-in-icon,description:zoom-in-description" icon-only icon="plus" variant="ghost" accessible-label=${() => this.text('zoomInLabel')}
                    title=${() => `${this.text('zoomInLabel')}${this.zoomInShortcut ? ` (${this.zoomInShortcut})` : ''}`}
                    data-shortcut=${this.props.zoomInShortcut}
                    disabled=${or(() => this.unavailable, () => this.viewportState().zoom >= this.normalizedZoom(this.maxZoom))}
                    onaction=${(event: Event) => { event.stopPropagation(); this.zoomBy(Math.abs(finite(this.zoomStep,10)),event); }}></cb-button>
                `)}
            </div><output part="position" hidden=${isNot(this.positionText)}>${this.positionText}</output>
        </div>`;
    }
    private containEvent = (event: Event): void => { event.stopPropagation() }
    private actionButtons(position: ViewportActionPosition): Template {
        return html`${repeat(() => this.actionsAt(position), action => html`
            <cb-button part="action" data-action-id=${action.id}
                exportparts="control:action-control,icon:action-icon,label:action-label,button-label:action-label"
                icon=${action.icon} icon-src=${action.iconSrc} icon-only=${Boolean(action.icon || action.iconSrc)} label=${action.label}
                accessible-label=${action.label} name=${action.name} size="sm" variant="ghost"
                title=${`${action.label}${action.shortcut && !action.label.endsWith(`(${action.shortcut})`) ? ` (${action.shortcut})` : ''}`}
                aria-keyshortcuts=${action.shortcut || null}
                pressed=${action.pressed} disabled=${or(() => this.unavailable, action.disabled)}
                onbeforeaction=${this.containEvent}
                onaction=${(event: CustomEvent<{ originalEvent?: Event }>) => {
                    event.stopPropagation(); this.activateAction(action.id, event.detail.originalEvent)
                }}
                onbeforechange=${(event: CustomEvent<{ originalEvent?: Event }>) => {
                    event.preventDefault(); event.stopPropagation(); this.activateAction(action.id, event.detail.originalEvent)
                }}></cb-button>`, { key: action => action.id })}`
    }
    private positionText = (): string => {
        const value=this.viewportState();
        return this.text('positionLabel').replace('{x}',String(Math.round(value.x))).replace('{y}',String(Math.round(value.y)));
    }
    private onWheel = (event: WheelEvent): void => {
        const surface = this.surface
        if (this.unavailable || !surface) return
        // Top-layer popups keep their composed ancestry inside the world.
        // They own wheel input even at a scroll edge; preventing the event
        // here would freeze the list and pan/zoom the canvas underneath it.
        const path = event.composedPath()
        if (path.slice(0, path.indexOf(surface)).some(node => node instanceof HTMLElement &&
            node.matches('[popover],dialog[open],[role="dialog"],[role="listbox"],[role="menu"]'))) return
        event.preventDefault()
        if (!event.ctrlKey && !event.metaKey) {
            this.panBy(-event.deltaX, -event.deltaY, event, false)
            return
        }
        if (!event.deltaY) return
        const bounds = surface.getBoundingClientRect()
        const scaleX = bounds.width / surface.offsetWidth || 1
        const scaleY = bounds.height / surface.offsetHeight || 1
        this.zoomAround((event.deltaY < 0 ? 1 : -1) * Math.abs(finite(this.zoomStep, 10)),
            (event.clientX - bounds.left - bounds.width / 2) / scaleX,
            (event.clientY - bounds.top - bounds.height / 2) / scaleY,
            event, false)
    }
    protected mount(): void {
        super.mount()
        this.listen(this, 'center', event => {
            if (event instanceof CustomEvent) this.centerArtboard(event as CustomEvent<{ readonly originalEvent?: Event }>)
        })
    }
    private centerArtboard = (event: CustomEvent<{ readonly originalEvent?: Event }>): void => {
        const artboard = event.composedPath()[0]
        const surface = this.surface
        if (!(artboard instanceof HTMLElement) || artboard.localName !== 'cb-artboard' || !surface) return
        const owner = event.composedPath().find(node => node instanceof HTMLElement && node.localName === 'cb-viewport')
        if (owner !== this) return
        const bounds = artboard.getBoundingClientRect(), viewport = surface.getBoundingClientRect()
        const current = this.viewportState(), scale = current.zoom / 100
        const x = (current.x + viewport.left + viewport.width / 2 - bounds.left - bounds.width / 2) / scale
        // Center boards that fit at actual size. For taller pages, center only
        // the first viewportful, leaving room above for the name/preview tools.
        const height = bounds.height / scale
        const topInset = Math.min(96, viewport.height / 4)
        const focusHeight = height > viewport.height ? viewport.height - 2 * topInset : height
        const y = (current.y + viewport.top + viewport.height / 2 - bounds.top) / scale - focusHeight / 2
        this.setViewport(100, x, y, event.detail.originalEvent)
    }
    private beginPan = (event: PointerEvent): void => {
        if (!this.surface || !this.canPan() || event.button !== 0)
            return;
        // Ancestors outside this surface (workspace, theme providers, etc.)
        // are not controls within the viewport and must not block dragging.
        const path = event.composedPath();
        const interactive = path.slice(0, path.indexOf(this.surface)).some(node => node instanceof HTMLElement && (node.matches('button,input,select,textarea,a') || node.localName.startsWith('cb-')));
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
export type { ViewportProps, ViewportAction, ViewportActionPosition, ViewportActionDetail } from './ViewportBase.js';

register('cb-viewport', Viewport)
