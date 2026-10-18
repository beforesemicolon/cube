import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet, slot, uid } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { token as v } from '../../theme/tokens.js'
import { actionLabel, createButton, createIconButton, type ActionControl } from '../../action/create.js'
import { createIcon } from '../../icons/paths.js'
import { AccordionBase, type AccordionAction, type AccordionContent, type AccordionItem } from './AccordionBase.js'

const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0}
[part~=root]{display:grid;inline-size:100%;min-inline-size:0}
[part~=group-description]{margin:0 0 var(--spacing-sm,8px);color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px)}
[part~=root][data-variant=simple] [part~=item]:first-of-type{border-block-start:1px solid var(--component-accordion-border,${v('--color-separator')})}
[part~=root][data-variant=container]{gap:var(--component-accordion-gap,var(--spacing-sm,8px))}
[part~=item]{min-inline-size:0;background:var(--component-accordion-background,${v('--color-surface')});border-block-end:1px solid var(--component-accordion-border,${v('--color-separator')})}
[part~=root][data-variant=container] [part~=item]{border:1px solid var(--component-accordion-border,${v('--color-separator')});border-radius:var(--component-accordion-radius,${v('--radius-sm')});overflow:clip}
[part~=item][data-expanded]{box-shadow:var(--component-accordion-expanded-shadow,none)}
[part~=header]{display:flex;align-items:stretch;min-inline-size:0;background:var(--component-accordion-trigger-background,${v('--color-surface-muted')})}
[part~=heading]{display:flex;flex:1;min-inline-size:0;margin:0}
[part~=trigger]{appearance:none;display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-md,12px);inline-size:100%;min-inline-size:0;min-block-size:var(--component-accordion-trigger-height,36px);padding:var(--component-accordion-trigger-padding,var(--spacing-sm,8px) var(--spacing-md,12px));border:0;border-radius:0;background:transparent;text-align:start;white-space:normal}
[part~=trigger]:hover:not(:disabled){background:var(--component-accordion-trigger-hover,${v('--color-active')})}
[part~=trigger]:focus-visible{position:relative;z-index:1;outline-offset:-2px}
[part~=trigger-content]{display:grid;min-inline-size:0;gap:2px}
[part~=label]{overflow:hidden;color:var(--component-accordion-label-color,${v('--color-foreground')});font-weight:500;text-overflow:ellipsis}
[part~=description]{color:var(--component-accordion-description-color,${v('--color-muted-foreground')});font-size:var(--component-caption-font-size,11px);font-weight:400}
[part~=indicator]{inline-size:14px;block-size:14px;transition:rotate var(--motion-duration-normal,160ms) ease-out}
[part~=item][data-expanded] [part~=indicator]{rotate:90deg}
[part~=actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px);padding-inline-end:var(--spacing-sm,8px)}
[part~=actions]:empty{display:none}
[part~=action]{--component-control-height:28px;align-self:center}
[part~=panel]{display:grid;grid-template-rows:0fr;visibility:hidden;opacity:0;transition:grid-template-rows var(--motion-duration-normal,160ms) ease-out,opacity var(--motion-duration-fast,100ms) ease-out,visibility 0s linear var(--motion-duration-normal,160ms)}
[part~=item][data-expanded] [part~=panel]{grid-template-rows:1fr;visibility:visible;opacity:1;transition-delay:0s}
[part~=panel-content]{min-block-size:0;overflow:hidden}
[part~=panel-inner]{padding:var(--component-accordion-content-padding,var(--spacing-md,12px));color:${v('--color-foreground')}}
[part~=disabled-reason]{padding:2px var(--spacing-md,12px) var(--spacing-xs,4px);color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px);background:${v('--color-surface')}}
[part~=empty]{padding:var(--spacing-md,12px);border:1px dashed ${v('--color-separator')};border-radius:${v('--radius-sm')};color:${v('--color-muted-foreground')}}
:host(:not([data-animated])) [part~=panel],:host(:not([data-animated])) [part~=indicator]{transition:none}
@media (prefers-reduced-motion:reduce){[part~=panel],[part~=indicator]{transition:none}}
`

interface ItemView {
    readonly root: HTMLElement
    readonly trigger: HTMLButtonElement
    readonly label: HTMLElement
    readonly description: HTMLElement
    readonly actions: HTMLElement
    readonly panel: HTMLElement
    readonly contentSlot: HTMLSlotElement
    readonly disabledReason: HTMLElement
    contentSource?: AccordionContent
    contentRenderer?: AccordionItem['renderContent']
}

function appendContent(parent: ParentNode, value: AccordionContent): void {
    if (Array.isArray(value)) { value.forEach(node => appendContent(parent, node)); return }
    if (typeof Node !== 'undefined' && value instanceof Node) { parent.append(value); return }
    if (value !== null && value !== undefined && value !== false) parent.append(document.createTextNode(String(value)))
}

function rendered(host: Accordion, item: AccordionItem, index: number, renderer: AccordionItem['renderContent'] | AccordionItem['renderActions'], fallback: AccordionContent): AccordionContent {
    if (typeof renderer !== 'function') return fallback
    try { return renderer({ accordion: host, item, index }) } catch (error) { host.onError(error); return null }
}

function accordionView(host: Accordion) {
    const root = el('div', 'root')
    const groupDescription = el('p', 'group-description description')
    const empty = el('div', 'empty')
    groupDescription.dataset.cbDescription = ''
    groupDescription.id = uid('cb-accordion-description')
    empty.setAttribute('role', 'status')
    const views = new Map<string, ItemView>()

    const focusRelative = (trigger: HTMLButtonElement, edge: 'next' | 'previous' | 'first' | 'last'): void => {
        const triggers = [...root.querySelectorAll<HTMLButtonElement>('[part~=trigger]:not(:disabled)')]
        if (!triggers.length) return
        const current = triggers.indexOf(trigger)
        const target = edge === 'first' ? triggers[0]
            : edge === 'last' ? triggers.at(-1)
                : edge === 'next' ? triggers[(current + 1 + triggers.length) % triggers.length]
                    : triggers[(current - 1 + triggers.length) % triggers.length]
        target?.focus()
    }

    const create = (id: string): ItemView => {
        const itemRoot = el('section', 'item')
        const header = el('div', 'header')
        const heading = el('div', 'heading')
        const trigger = el('button', 'trigger')
        const triggerContent = el('span', 'trigger-content')
        const label = el('span', 'label')
        const description = el('span', 'description')
        const indicator = createIcon('right', 'indicator icon')
        const actions = el('div', 'actions')
        const panel = el('div', 'panel')
        const panelContent = el('div', 'panel-content')
        const panelInner = el('div', 'panel-inner')
        const contentSlot = slot(`item-${id}`, '', 'content')
        const disabledReason = el('div', 'disabled-reason')
        const triggerId = uid('cb-accordion-trigger')
        const panelId = uid('cb-accordion-panel')
        disabledReason.id = uid('cb-accordion-disabled-reason')
        trigger.type = 'button'
        trigger.id = triggerId
        trigger.dataset.accordionId = id
        panel.id = panelId
        panel.setAttribute('role', 'region')
        heading.setAttribute('role', 'heading')
        aria(trigger, 'aria-controls', panelId)
        aria(panel, 'aria-labelledby', triggerId)
        triggerContent.append(label, description)
        trigger.append(triggerContent, indicator)
        heading.append(trigger)
        header.append(heading, actions)
        panelInner.append(contentSlot)
        panelContent.append(panelInner)
        panel.append(panelContent)
        itemRoot.append(header, panel, disabledReason)
        trigger.addEventListener('click', event => host.toggle(id, event))
        trigger.addEventListener('keydown', event => {
            const edge = event.key === 'ArrowDown' ? 'next' : event.key === 'ArrowUp' ? 'previous' : event.key === 'Home' ? 'first' : event.key === 'End' ? 'last' : null
            if (!edge) return
            event.preventDefault()
            focusRelative(trigger, edge)
        })
        return { root: itemRoot, trigger, label, description, actions, panel, contentSlot, disabledReason }
    }

    const configureAction = (control: ActionControl, action: AccordionAction, item: AccordionItem): void => {
        actionLabel(control, scalarText(action.label))
        control.disabled = bool(action.disabled) || host.itemDisabled(item)
        control.variant = action.variant ?? 'ghost'
    }

    const syncActions = (view: ItemView, item: AccordionItem, index: number): void => {
        view.actions.replaceChildren()
        const actions = Array.isArray(item.actions) ? item.actions : []
        for (const action of actions) {
            if (!action || typeof action !== 'object' || !scalarText(action.id).trim() || !scalarText(action.label).trim()) continue
            const activate = (event: CustomEvent): void => host.emit('cb-item-action', { item, id: item.id, action, actionId: action.id, originalEvent: event })
            const control = scalarText(action.icon).trim() ? createIconButton('action', scalarText(action.icon), activate) : createButton('action', activate)
            configureAction(control, action, item)
            view.actions.append(control)
        }
        const renderedActions = rendered(host, item, index, item.renderActions, null)
        appendContent(view.actions, renderedActions)
        const actionSlot = slot(`actions-${item.id}`, '', 'actions-slot')
        const hasRenderedActions = Array.isArray(renderedActions) ? renderedActions.length > 0
            : renderedActions !== null && renderedActions !== undefined && renderedActions !== false
        const syncVisibility = (): void => {
            view.actions.hidden = actions.length === 0 && !hasRenderedActions && actionSlot.assignedNodes({ flatten: true }).length === 0
        }
        actionSlot.addEventListener('slotchange', syncVisibility)
        view.actions.append(actionSlot)
        syncVisibility()
    }

    const syncContent = (view: ItemView, item: AccordionItem, index: number): void => {
        view.contentSlot.name = scalarText(item.slot).trim() || `item-${item.id}`
        if (view.contentSource === item.content && view.contentRenderer === item.renderContent) return
        view.contentSlot.replaceChildren()
        appendContent(view.contentSlot, rendered(host, item, index, item.renderContent, item.content))
        view.contentSource = item.content
        view.contentRenderer = item.renderContent
    }

    const update = (): void => {
        const items = host.itemList()
        const expanded = host.expansionSet()
        const activeIds = new Set(items.map(item => item.id))
        for (const [id, view] of views) if (!activeIds.has(id)) { view.root.remove(); views.delete(id) }
        root.dataset.variant = host.resolvedVariant()
        host.dataset.variant = host.resolvedVariant()
        host.toggleAttribute('data-animated', bool(host.animated, true))
        const accessibleName = scalarText(host.accessibleLabel) || scalarText(host.label)
        aria(root, 'role', accessibleName ? 'group' : null)
        aria(root, 'aria-label', accessibleName)
        groupDescription.textContent = scalarText(host.description)
        groupDescription.hidden = !groupDescription.textContent
        aria(root, 'aria-describedby', groupDescription.hidden ? null : groupDescription.id)
        empty.textContent = scalarText(host.emptyLabel)
        empty.hidden = items.length > 0 || !empty.textContent
        for (const [index, item] of items.entries()) {
            const id = item.id
            const view = views.get(id) ?? create(id)
            if (!views.has(id)) views.set(id, view)
            const isExpanded = expanded.has(id)
            const disabled = host.itemDisabled(item)
            const active = host.shadowRoot?.activeElement ?? host.ownerDocument.activeElement
            if (!isExpanded && active && view.panel.contains(active)) view.trigger.focus()
            view.root.toggleAttribute('data-expanded', isExpanded)
            view.root.toggleAttribute('data-disabled', disabled)
            view.trigger.disabled = disabled
            view.trigger.dataset.accordionId = id
            view.label.textContent = scalarText(item.label) || id
            view.description.textContent = scalarText(item.description)
            view.description.hidden = !view.description.textContent
            view.disabledReason.textContent = disabled ? scalarText(item.disabledReason) : ''
            view.disabledReason.hidden = !view.disabledReason.textContent
            aria(view.trigger, 'aria-describedby', view.disabledReason.hidden ? null : view.disabledReason.id)
            aria(view.trigger, 'aria-expanded', isExpanded)
            aria(view.trigger, 'aria-disabled', disabled || null)
            aria(view.panel, 'aria-hidden', !isExpanded)
            const heading = view.root.querySelector('[part~=heading]')
            if (heading) aria(heading, 'aria-level', host.resolvedHeadingLevel())
            view.panel.inert = !isExpanded
            syncActions(view, item, index)
            syncContent(view, item, index)
            root.insertBefore(view.root, empty)
        }
    }
    root.append(groupDescription, empty)
    return { root: fragment(sheet(css), root), update }
}

export class Accordion extends AccordionBase {
    private view?: ReturnType<typeof accordionView>
    render(): Node { this.view = accordionView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-accordion', Accordion)
export { AccordionBase }
export type {
    AccordionAction, AccordionBulkExpansionDetail, AccordionContent, AccordionExpansionChangeDetail,
    AccordionExpansionDetail, AccordionItem, AccordionItemContext, AccordionProps, AccordionVariant,
} from './AccordionBase.js'
