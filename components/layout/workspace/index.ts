import componentStylesheet from './styles.css?inline'
import { isNot, or, type Template, html, state } from '../../core/runtime.js'

import { finite } from '../../core/value.js';
import { WorkspaceBase, type WorkspacePanel } from './WorkspaceBase.js';

export class Workspace extends WorkspaceBase {
    stylesheet = componentStylesheet

    private readonly headerVisible = state(false);
    private get panels(): Map<WorkspacePanel,{handle:HTMLElement}> {
        const result=new Map<WorkspacePanel,{handle:HTMLElement}>();
        for(const panel of ['start','end','bottom'] as const) {
            const node=this.refs[`${panel}Handle`]?.[0]; if(node instanceof HTMLElement) result.set(panel,{handle:node});
        } return result;
    }
    render(): Template {
        return html`<header part="header" hidden=${isNot(this.headerVisible[0])} onslotchange=${this.headerChanged}>
            <slot ref="header" name="header" part="header-content"></slot></header>
            ${this.panelTemplate('start')}<main part="main" aria-label=${this.accessibleName}><slot part="main-content"></slot></main>
            ${this.panelTemplate('end')}${this.panelTemplate('bottom')}
            <cb-button part="backdrop" exportparts="control:backdrop-control,label:backdrop-label,button-label:backdrop-label,icon:backdrop-icon,description:backdrop-description" data-bare data-semantic-host accessible-label=${this.props.closeMobileLabel}
                onaction=${(event: Event) => { event.stopPropagation(); if(this.mobilePanel) this.togglePanel(this.mobilePanel,false,event); }}></cb-button>`;
    }
    private headerChanged = (): void => {
        const slot = this.refs.header?.[0]
        if (slot instanceof HTMLSlotElement) this.headerVisible[1](slot.assignedNodes({ flatten: true }).length > 0)
    }
    private panelTemplate(panel: WorkspacePanel): Template {
        const closed=(): boolean => this.mobile ? this.mobilePanel !== panel : !this.isPanelOpen(panel);
        const body=html`<div part="panel-actions"><cb-button part="panel-toggle close-panel" exportparts="control:panel-toggle-control,label:panel-toggle-label,button-label:panel-toggle-label,icon:panel-toggle-icon,description:panel-toggle-description,control:close-panel-control,label:close-panel-label,button-label:close-panel-label,icon:close-panel-icon,description:close-panel-description" icon-only variant="ghost" size="sm"
                icon=${panel === 'start' ? 'left' : panel === 'end' ? 'right' : 'down'}
                accessible-label=${() => this.panelToggleLabel(panel,true)} disabled=${() => this.unavailable}
                onaction=${(event: Event) => { event.stopPropagation(); this.togglePanel(panel,false,event); }}></cb-button></div>
            <slot name=${panel} part=${`${panel}-content`}></slot>
            <div part=${`resize-handle ${panel}-resize-handle`} ref=${`${panel}Handle`} role="separator"
                aria-orientation=${panel === 'bottom' ? 'horizontal' : 'vertical'}
                tabindex=${() => this.unavailable || this.mobile ? -1 : 0}
                aria-label=${() => this.panelLabel(panel)} aria-valuenow=${() => this.panelSize(panel)}
                aria-valuemin=${() => panel === 'start' ? finite(this.minStartSize,180) : panel === 'end' ? finite(this.minEndSize,220) : finite(this.minBottomSize,140)}
                aria-valuemax=${() => panel === 'start' ? finite(this.maxStartSize,560) : panel === 'end' ? finite(this.maxEndSize,720) : finite(this.maxBottomSize,640)}
                onpointerdown=${(event: PointerEvent) => this.beginResize(panel,event)} onkeydown=${(event: KeyboardEvent) => this.resizeKey(panel,event)}></div>`;
        const region=panel === 'bottom' ? html`<section part="panel bottom-panel" hidden=${closed} inert=${() => closed() ? '' : null} aria-label=${() => this.panelLabel(panel)}>${body}</section>`
            : html`<aside part=${`panel ${panel}-panel`} hidden=${closed} inert=${() => closed() ? '' : null} aria-label=${() => this.panelLabel(panel)}>${body}</aside>`;
        return html`${region}<div part=${`rail ${panel}-rail`} hidden=${or(() => this.mobile, () => this.isPanelOpen(panel))}>
            <cb-button part="panel-toggle open-panel" exportparts="control:panel-toggle-control,label:panel-toggle-label,button-label:panel-toggle-label,icon:panel-toggle-icon,description:panel-toggle-description,control:open-panel-control,label:open-panel-label,button-label:open-panel-label,icon:open-panel-icon,description:open-panel-description" icon-only variant="ghost" size="sm" icon=${panel === 'start' ? 'right' : panel === 'end' ? 'left' : 'up'}
                accessible-label=${() => this.panelToggleLabel(panel,false)} disabled=${() => this.unavailable}
                onaction=${(event: Event) => { event.stopPropagation(); this.togglePanel(panel,true,event); }}></cb-button></div>`;
    }
    protected syncView(): void {
        for(const panel of ['start','end','bottom'] as const) {
            this.style.setProperty(`--workspace-${panel}-size`,`${this.panelSize(panel)}px`);
            this.style.setProperty(`--workspace-${panel}-track`,this.isPanelOpen(panel) ? `${this.panelSize(panel)}px` : '40px');
        }
        this.setAttribute('mobile-panel',this.mobilePanel);
    }
    private beginResize(panel: WorkspacePanel, event: PointerEvent): void {
        const view = this.panels.get(panel);
        if (!view || this.unavailable || this.mobile)
            return;
        const startSize = this.panelSize(panel);
        const startPosition = panel === 'bottom' ? event.clientY : event.clientX;
        view.handle.dataset.resizing = '';
        view.handle.setPointerCapture(event.pointerId);
        const move = (moveEvent: PointerEvent): void => {
            const current = panel === 'bottom' ? moveEvent.clientY : moveEvent.clientX;
            const direction = panel === 'end' || panel === 'bottom' ? -1 : 1;
            this.resizePanel(panel, startSize + (current - startPosition) * direction, moveEvent);
        };
        const end = (endEvent: PointerEvent): void => {
            view.handle.removeAttribute('data-resizing');
            if (view.handle.hasPointerCapture(endEvent.pointerId))
                view.handle.releasePointerCapture(endEvent.pointerId);
            view.handle.removeEventListener('pointermove', move);
            view.handle.removeEventListener('pointerup', end);
            view.handle.removeEventListener('pointercancel', end);
        };
        view.handle.addEventListener('pointermove', move);
        view.handle.addEventListener('pointerup', end);
        view.handle.addEventListener('pointercancel', end);
    }
    private resizeKey(panel: WorkspacePanel, event: KeyboardEvent): void {
        const step = Math.max(1, finite(this.resizeStep, 16)) * (event.shiftKey ? 4 : 1);
        let next: number | undefined;
        if (panel === 'bottom') {
            if (event.key === 'ArrowUp')
                next = this.panelSize(panel) + step;
            else if (event.key === 'ArrowDown')
                next = this.panelSize(panel) - step;
        }
        else {
            const direction = panel === 'start' ? 1 : -1;
            if (event.key === 'ArrowRight')
                next = this.panelSize(panel) + step * direction;
            else if (event.key === 'ArrowLeft')
                next = this.panelSize(panel) - step * direction;
        }
        if (event.key === 'Home')
            next = panel === 'start' ? this.minStartSize : panel === 'end' ? this.minEndSize : this.minBottomSize;
        if (event.key === 'End')
            next = panel === 'start' ? this.maxStartSize : panel === 'end' ? this.maxEndSize : this.maxBottomSize;
        if (next === undefined)
            return;
        event.preventDefault();
        this.resizePanel(panel, finite(next), event);
    }
}
export { WorkspaceBase };
export type { WorkspaceProps, WorkspacePanel } from './WorkspaceBase.js';
