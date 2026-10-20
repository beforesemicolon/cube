import componentStylesheet from './styles.css?inline'
import { isNot, and, html, state, type Template } from '../../core/runtime.js'

import { uid } from '../../core/id.js'
import { bool, scalarText } from '../../core/value.js'
import { TooltipBase } from './TooltipBase.js'

export class Tooltip extends TooltipBase {
    stylesheet = componentStylesheet

    private readonly tooltipId = uid('cb-tooltip')
    private readonly slottedContent = state(false)
    private describedElements = new Map<Element, string | null>()
    private get triggerSlot(): HTMLSlotElement | undefined { const node = this.refs.trigger?.[0]; return node instanceof HTMLSlotElement ? node : undefined }
    private get bubble(): HTMLElement | undefined { const node = this.refs.bubble?.[0]; return node instanceof HTMLElement ? node : undefined }
    render(): Template {
        return html`
            <span part="trigger" onslotchange="${this.linkTrigger}" onpointerenter="${() => this.schedule(true)}" onpointerleave="${() => this.schedule(false)}"
                onfocus="${[() => this.schedule(true), true]}" onblur="${[() => this.schedule(false), true]}">
                <slot ref="trigger" part="trigger-content"></slot>
            </span>
            <span ref="bubble" id="${this.tooltipId}" part="tooltip" role="tooltip" onslotchange="${this.contentChanged}"
                hidden="${and(isNot(this.props.content), isNot(this.slottedContent[0]))}">
                <slot ref="content" name="content" part="content">${this.props.content}</slot>
            </span>`
    }
    private contentChanged = (): void => {
        const slot = this.refs.content?.[0]
        if (slot instanceof HTMLSlotElement) this.slottedContent[1](slot.assignedNodes().length > 0)
        this.syncTooltip()
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
