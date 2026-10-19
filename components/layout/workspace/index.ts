import { type Template, html, state } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { finite } from '../../core/value.js';
import { WorkspaceBase, type WorkspacePanel } from './WorkspaceBase.js';
const css = editorCSS + `
:host{display:grid;position:relative;isolation:isolate;overflow:hidden;min-inline-size:0;min-block-size:360px;block-size:var(--component-workspace-height,100%);grid-template-columns:var(--workspace-start-track,40px) minmax(0,1fr) var(--workspace-end-track,40px);grid-template-rows:auto minmax(0,1fr) var(--workspace-bottom-track,40px);grid-template-areas:'header header header' 'start main end' 'start bottom end';background:var(--color-background);border:1px solid var(--color-separator);border-radius:var(--radius-md)}
[part~=header]{grid-area:header;z-index:4;min-inline-size:0;border-block-end:1px solid var(--color-separator);background:var(--color-surface)}
[part~=main]{grid-area:main;position:relative;min-inline-size:0;min-block-size:0;overflow:auto;background:var(--color-background)}
[part~=panel],[part~=rail]{position:relative;min-inline-size:0;min-block-size:0;background:var(--color-surface)}
[part~=start-panel],[part~=start-rail]{grid-area:start;border-inline-end:1px solid var(--color-separator)}
[part~=end-panel],[part~=end-rail]{grid-area:end;border-inline-start:1px solid var(--color-separator)}
[part~=bottom-panel],[part~=bottom-rail]{grid-area:bottom;border-block-start:1px solid var(--color-separator)}
[part~=panel]{overflow:auto}[part~=panel-actions]{position:sticky;z-index:3;inset-block-start:0;display:flex;justify-content:flex-end;padding:var(--spacing-xs,4px);pointer-events:none}[part~=panel-actions]>*{pointer-events:auto}
[part~=rail]{display:grid;place-items:start center;padding:var(--spacing-xs,4px)}[part~=bottom-rail]{place-items:center end}
[part~=resize-handle]{position:absolute;z-index:5;touch-action:none;outline-offset:-2px}
[part~=start-panel] [part~=resize-handle]{inset-block:0;inset-inline-end:-5px;inline-size:10px;cursor:col-resize}
[part~=end-panel] [part~=resize-handle]{inset-block:0;inset-inline-start:-5px;inline-size:10px;cursor:col-resize}
[part~=bottom-panel] [part~=resize-handle]{inset-inline:0;inset-block-start:-5px;block-size:10px;cursor:row-resize}
[part~=resize-handle]::after{content:'';position:absolute;background:transparent;transition:background var(--motion-duration-fast) ease-out}
[part~=start-panel] [part~=resize-handle]::after,[part~=end-panel] [part~=resize-handle]::after{inset-block:0;inset-inline:4px;inline-size:2px}
[part~=bottom-panel] [part~=resize-handle]::after{inset-inline:0;inset-block:4px;block-size:2px}
[part~=resize-handle]:hover::after,[part~=resize-handle]:focus-visible::after,[part~=resize-handle][data-resizing]::after{background:var(--color-primary)}
[part~=backdrop]{display:none}
:host([data-mobile]){grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);grid-template-areas:'header' 'main'}
:host([data-mobile]) [part~=rail],:host([data-mobile]) [part~=resize-handle]{display:none}
:host([data-mobile]) [part~=panel]{position:absolute;z-index:7;display:none;box-shadow:var(--shadow-lg,0 20px 60px rgba(0,0,0,.24))}
:host([data-mobile][mobile-panel=start]) [part~=start-panel],:host([data-mobile][mobile-panel=end]) [part~=end-panel],:host([data-mobile][mobile-panel=bottom]) [part~=bottom-panel]{display:block}
:host([data-mobile]) [part~=start-panel]{inset-block:0;inset-inline-start:0;inline-size:min(88%,var(--workspace-start-size));border-inline-end:1px solid var(--color-separator)}
:host([data-mobile]) [part~=end-panel]{inset-block:0;inset-inline-end:0;inline-size:min(88%,var(--workspace-end-size));border-inline-start:1px solid var(--color-separator)}
:host([data-mobile]) [part~=bottom-panel]{inset-inline:0;inset-block-end:0;max-block-size:80%;block-size:var(--workspace-bottom-size);border-block-start:1px solid var(--color-separator)}
:host([data-mobile][mobile-panel]:not([mobile-panel=''])) [part~=backdrop]{display:block;position:absolute;z-index:6;inset:0;border:0;border-radius:0;background:var(--component-overlay-backdrop,rgba(10,16,22,.48));padding:0}
:host([data-mobile][mobile-panel]:not([mobile-panel=''])) [part~=backdrop]::part(control){inline-size:100%;block-size:100%}
`;
export class Workspace extends WorkspaceBase {
    private readonly headerVisible = state(false);
    private get panels(): Map<WorkspacePanel,{handle:HTMLElement}> {
        const result=new Map<WorkspacePanel,{handle:HTMLElement}>();
        for(const panel of ['start','end','bottom'] as const) {
            const node=this.refs[`${panel}Handle`]?.[0]; if(node instanceof HTMLElement) result.set(panel,{handle:node});
        } return result;
    }
    render(): Template {
        return html`<style part="styles">${css}</style><header part="header" hidden=${() => !this.headerVisible[0]()}>
            <slot name="header" part="header-content" onslotchange=${(event: Event) => {
                if(event.currentTarget instanceof HTMLSlotElement) this.headerVisible[1](event.currentTarget.assignedNodes({flatten:true}).length>0);
            }}></slot></header>
            ${this.panelTemplate('start')}<main part="main" aria-label=${() => this.accessibleName()}><slot part="main-content"></slot></main>
            ${this.panelTemplate('end')}${this.panelTemplate('bottom')}
            <cb-button part="backdrop" exportparts="control:backdrop-control,label:backdrop-label,button-label:backdrop-label,icon:backdrop-icon,description:backdrop-description" data-bare data-semantic-host accessible-label=${() => this.closeMobileLabel}
                onaction=${(event: Event) => { event.stopPropagation(); if(this.mobilePanel) this.togglePanel(this.mobilePanel,false,event); }}></cb-button>`;
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
        return html`${region}<div part=${`rail ${panel}-rail`} hidden=${() => this.mobile || this.isPanelOpen(panel)}>
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
