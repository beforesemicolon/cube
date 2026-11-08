import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, or, when, repeat, type Template, html, state } from '../../core/runtime.js'
import { elementRefs } from '../../core/refs.js'
import { RovingFocus } from '../../core/roving.js'
import { uid } from '../../core/id.js'

import { finite, scalarText } from '../../core/value.js';
import { WorkspaceBase, type WorkspaceItem, type WorkspacePanel } from './WorkspaceBase.js';

export class Workspace extends WorkspaceBase {
    stylesheet = componentStylesheet

    private readonly headerVisible = state(false);
    private readonly contentReady = state(false)
    private readonly workspaceId = uid('cb-workspace')
    private readonly tabFocus = new Map<WorkspacePanel, RovingFocus>(
        (['start', 'end', 'bottom'] as const).map(panel => [panel, new RovingFocus(
            () => elementRefs(this.refs[`${panel}Tabs`]), () => panel === 'bottom' ? 'horizontal' : 'vertical')]))
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
                onaction=${(event: Event) => {
                    event.stopPropagation()
                    const panel = this.mobilePanel
                    if (!panel) return
                    const item = this.tabbed() ? this.activeItem(panel) : undefined
                    if (item) this.selectTab(panel, item.id, event)
                    else this.togglePanel(panel, false, event)
                }}></cb-button>`;
    }
    protected mount(): void {
        // Restore saved selection and resolve responsive visibility before any
        // application factory runs, including on the first mobile mount.
        super.mount()
        this.contentReady[1](true)
        this.cleanup(() => this.contentReady[1](false))
    }
    private headerChanged = (): void => {
        const slot = this.refs.header?.[0]
        if (slot instanceof HTMLSlotElement) this.headerVisible[1](slot.assignedNodes({ flatten: true }).length > 0)
    }
    private panelTemplate(panel: WorkspacePanel): Template {
        return html`${when(this.tabbed, this.tabbedPanelTemplate(panel), this.singlePanelTemplate(panel))}`
    }
    private tabbedPanelTemplate(panel: WorkspacePanel): Template {
        const expanded = (): boolean => this.panelExpanded(panel)
        const active = (): string => this.activeItem(panel)?.id ?? ''
        const panelId = `${this.workspaceId}-${panel}-panel`
        const tabId = (id: string): string => `${this.workspaceId}-${panel}-${encodeURIComponent(id)}-tab`
        // repeat clears its cache on collapse, so reopening invokes the factory
        // anew. Other panels, resizing, and metadata updates retain mounted content.
        const content = repeat(() => {
            const item = this.activeItem(panel)
            return this.contentReady[0]() && expanded() && item ? [item] : []
        }, item => html`<cb-panel-header part="tab-heading" label=${item.name} description=${item.description}
            exportparts="header:tab-header,heading:tab-title,description:tab-description"></cb-panel-header>
            <div part="tab-content">${this.renderTabContent(item)}</div>`, { key: item => item.id })
        return html`<div part=${`tabbed-region ${panel}-tabs-region`} hidden=${() => !this.panelItems(panel).length}
            data-expanded=${() => expanded() ? '' : null}>
            <div part=${`tabs ${panel}-tabs`} role="tablist" aria-label=${() => this.panelLabel(panel)}
                aria-orientation=${panel === 'bottom' ? 'horizontal' : 'vertical'}
                onkeydown=${(event: KeyboardEvent) => this.tabFocus.get(panel)?.keydown(event)}>
                ${repeat(() => this.panelItems(panel), item => html`<cb-button part="workspace-tab" ref=${`${panel}Tabs`}
                    data-bare data-semantic-host role="tab" data-label=${item.name} id=${tabId(item.id)}
                    label=${scalarText(item.collapsedName) || item.name} icon=${item.iconName} icon-src=${item.iconSrc}
                    icon-only=${Boolean(scalarText(item.iconName) || scalarText(item.iconSrc))} title=${`${item.name}${item.shortcut ? ` (${item.shortcut})` : ''}`}
                    aria-keyshortcuts=${item.shortcut || null}
                    accessible-label=${scalarText(item.iconName) || scalarText(item.iconSrc) || !scalarText(item.collapsedName) ? item.name : `${item.collapsedName}: ${item.name}`}
                    disabled=${() => this.unavailable}
                    aria-controls=${panelId} aria-selected=${() => expanded() && active() === item.id ? 'true' : 'false'}
                    aria-expanded=${() => expanded() && active() === item.id ? 'true' : 'false'}
                    tabindex=${() => active() === item.id ? 0 : -1}
                    onbeforeaction=${(event: Event) => event.stopPropagation()}
                    onaction=${(event: Event) => { event.stopPropagation(); this.selectTab(panel, item.id, event) }}></cb-button>`, { key: item => item.id })}
            </div>
            <section part=${`panel ${panel}-panel tabbed-panel`} id=${panelId} role="tabpanel"
                aria-labelledby=${() => tabId(active())} hidden=${isNot(expanded)} inert=${when(expanded, null, '')}>
                ${content}${this.resizeHandle(panel)}
            </section>
        </div>`
    }
    private renderTabContent(item: WorkspaceItem): Template | Node | null {
        try { return item.renderContent() }
        catch (error) { this.onError(error); return null }
    }
    private resizeHandle(panel: WorkspacePanel): Template {
        return html`<div part=${`resize-handle ${panel}-resize-handle`} ref=${`${panel}Handle`} role="separator"
            aria-orientation=${panel === 'bottom' ? 'horizontal' : 'vertical'}
            tabindex=${() => this.unavailable || this.mobile ? -1 : 0}
            aria-label=${() => this.panelLabel(panel)} aria-valuenow=${() => this.panelSize(panel)}
            aria-valuemin=${() => panel === 'start' ? finite(this.minStartSize,180) : panel === 'end' ? finite(this.minEndSize,220) : finite(this.minBottomSize,140)}
            aria-valuemax=${() => panel === 'start' ? finite(this.maxStartSize,560) : panel === 'end' ? finite(this.maxEndSize,720) : finite(this.maxBottomSize,640)}
            onpointerdown=${(event: PointerEvent) => this.beginResize(panel,event)} onkeydown=${(event: KeyboardEvent) => this.resizeKey(panel,event)}></div>`
    }
    private singlePanelTemplate(panel: WorkspacePanel): Template {
        const closed=(): boolean => this.mobile ? this.mobilePanel !== panel : !this.isPanelOpen(panel);
        const body=html`<div part="panel-actions"><cb-button part="panel-toggle close-panel" exportparts="control:panel-toggle-control,label:panel-toggle-label,button-label:panel-toggle-label,icon:panel-toggle-icon,description:panel-toggle-description,control:close-panel-control,label:close-panel-label,button-label:close-panel-label,icon:close-panel-icon,description:close-panel-description" icon-only variant="ghost" size="sm"
                icon=${panel === 'start' ? 'left' : panel === 'end' ? 'right' : 'down'}
                accessible-label=${() => this.panelToggleLabel(panel,true)} disabled=${() => this.unavailable}
                onaction=${(event: Event) => { event.stopPropagation(); this.togglePanel(panel,false,event); }}></cb-button></div>
            <slot name=${panel} part=${`${panel}-content`}></slot>
            ${this.resizeHandle(panel)}`;
        const region=panel === 'bottom' ? html`<section part="panel bottom-panel" hidden=${closed} inert=${() => closed() ? '' : null} aria-label=${() => this.panelLabel(panel)}>${body}</section>`
            : html`<aside part=${`panel ${panel}-panel`} hidden=${closed} inert=${() => closed() ? '' : null} aria-label=${() => this.panelLabel(panel)}>${body}</aside>`;
        return html`${region}<div part=${`rail ${panel}-rail`} hidden=${or(() => this.mobile, () => this.isPanelOpen(panel))}>
            <cb-button part="panel-toggle open-panel" exportparts="control:panel-toggle-control,label:panel-toggle-label,button-label:panel-toggle-label,icon:panel-toggle-icon,description:panel-toggle-description,control:open-panel-control,label:open-panel-label,button-label:open-panel-label,icon:open-panel-icon,description:open-panel-description" icon-only variant="ghost" size="sm" icon=${panel === 'start' ? 'right' : panel === 'end' ? 'left' : 'up'}
                accessible-label=${() => this.panelToggleLabel(panel,false)} disabled=${() => this.unavailable}
                onaction=${(event: Event) => { event.stopPropagation(); this.togglePanel(panel,true,event); }}></cb-button></div>`;
    }
    protected syncView(): void {
        this.dataset.variant = this.tabbed() ? 'tabbed' : 'default'
        for(const panel of ['start','end','bottom'] as const) {
            this.style.setProperty(`--workspace-${panel}-size`,`${this.panelSize(panel)}px`);
            const empty = this.tabbed() && !this.panelItems(panel).length
            this.style.setProperty(`--workspace-${panel}-rail`, empty ? '0px' : '40px')
            this.style.setProperty(`--workspace-${panel}-track`, empty ? '0px' : this.isPanelOpen(panel) ? `${this.panelSize(panel)}px` : '40px');
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
export type { WorkspaceProps, WorkspacePanel, WorkspaceItem, WorkspaceTabChangeDetail } from './WorkspaceBase.js';

register('cb-workspace', Workspace)
