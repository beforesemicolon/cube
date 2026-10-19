import { html, state, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { uid } from '../../core/id.js'
import { bool, scalarText } from '../../core/value.js'
import { TooltipBase } from './TooltipBase.js'
const css = editorCSS + `:host{position:relative;display:inline-flex}[part=trigger]{display:inline-flex}[part=tooltip]{position:absolute;z-index:var(--z-index-tooltip,100);inline-size:max-content;max-inline-size:min(280px,80vw);padding:4px 8px;border-radius:var(--radius-sm,6px);background:var(--color-foreground,#20262b);color:var(--color-background,#fff);font-size:var(--component-caption-font-size,11px);line-height:1.4;pointer-events:none;opacity:0;visibility:hidden;transition:opacity var(--motion-duration-fast,100ms) ease-out;inset-block-end:calc(100% + 6px);inset-inline-start:50%;translate:-50% 0}:host([open]) [part=tooltip]{opacity:1;visibility:visible}:host([data-placement=bottom]) [part=tooltip]{inset-block-start:calc(100% + 6px);inset-block-end:auto}:host([data-placement=left]) [part=tooltip]{inset-inline-end:calc(100% + 6px);inset-inline-start:auto;inset-block-start:50%;inset-block-end:auto;translate:0 -50%}:host([data-placement=right]) [part=tooltip]{inset-inline-start:calc(100% + 6px);inset-block-start:50%;inset-block-end:auto;translate:0 -50%}`;
export class Tooltip extends TooltipBase {
    private readonly tooltipId = uid('cb-tooltip')
    private readonly slottedContent = state(false)
    private describedElements = new Map<Element, string | null>()
    private get triggerSlot(): HTMLSlotElement | undefined { const node = this.refs.trigger?.[0]; return node instanceof HTMLSlotElement ? node : undefined }
    private get bubble(): HTMLElement | undefined { const node = this.refs.bubble?.[0]; return node instanceof HTMLElement ? node : undefined }
    render(): Template {
        return html`<style part="styles">${css}</style>
            <span part="trigger" onpointerenter="${() => this.schedule(true)}" onpointerleave="${() => this.schedule(false)}"
                onfocus="${[() => this.schedule(true), true]}" onblur="${[() => this.schedule(false), true]}">
                <slot ref="trigger" part="trigger-content" onslotchange="${this.linkTrigger}"></slot>
            </span>
            <span ref="bubble" id="${this.tooltipId}" part="tooltip" role="tooltip"
                hidden="${() => !scalarText(this.content) && !this.slottedContent[0]()}">
                <slot name="content" part="content" onslotchange="${(event: Event) => { const slot = event.currentTarget; if (slot instanceof HTMLSlotElement) this.slottedContent[1](slot.assignedNodes().length > 0); this.syncTooltip() }}">${() => scalarText(this.content)}</slot>
            </span>`
    }
    protected syncTooltip(): void {
        this.dataset.placement = ['top', 'right', 'bottom', 'left'].includes(this.placement ?? '') ? this.placement ?? 'top' : 'top'
        this.toggleAttribute('open', bool(this.open) && Boolean(scalarText(this.content) || this.slottedContent[0]()))
        this.linkTrigger()
    }
    protected unmount(): void {
        super.unmount();
        this.restoreDescriptions();
    }
    private linkTrigger = (): void => {
        if (!this.triggerSlot || !this.bubble)
            return;
        const assigned = new Set(this.triggerSlot.assignedElements());
        for (const element of this.describedElements.keys()) {
            if (!assigned.has(element))
                this.restoreDescription(element);
        }
        for (const element of assigned) {
            if (!this.describedElements.has(element))
                this.describedElements.set(element, element.getAttribute('aria-describedby'));
            const ids = new Set((element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
            ids.add(this.bubble.id);
            element.setAttribute('aria-describedby', [...ids].join(' '));
        }
    }
    private restoreDescriptions(): void {
        for (const element of [...this.describedElements.keys()])
            this.restoreDescription(element);
    }
    private restoreDescription(element: Element): void {
        const previous = this.describedElements.get(element);
        if (previous === null)
            element.removeAttribute('aria-describedby');
        else if (previous !== undefined)
            element.setAttribute('aria-describedby', previous);
        this.describedElements.delete(element);
    }
}
export { TooltipBase };
export type { TooltipProps } from './TooltipBase.js';
