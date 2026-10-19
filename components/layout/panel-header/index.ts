import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { actionLabel, createIconButton } from '../../action/create.js'
import type { Button } from '../../action/button/index.js'
import { PanelHeaderBase } from './PanelHeaderBase.js'

export class PanelHeader extends PanelHeaderBase {
    private heading?: HTMLSlotElement
    private descriptionNode?: HTMLElement
    private toggleButton?: Button

    render(): Node {
        const header = el('header', 'header')
        const copy = el('div', 'copy')
        this.heading = slot('heading', '', 'heading')
        this.descriptionNode = el('p', 'description')
        this.descriptionNode.dataset.cbDescription = ''
        copy.append(this.heading, this.descriptionNode)
        const actions = el('div', 'actions')
        actions.append(slot('actions', '', 'action-content'))
        this.toggleButton = createIconButton('toggle', 'down', event => this.toggleExpanded(event))
        actions.append(this.toggleButton)
        header.append(copy, actions)
        return fragment(sheet(editorCSS + `
:host{display:block;min-inline-size:0}
[part~=header]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-md,12px);min-block-size:var(--component-panel-header-height,44px);padding:var(--component-panel-header-padding,var(--spacing-sm,8px) var(--spacing-md,12px));border-block-end:1px solid var(--color-separator);background:var(--component-panel-header-background,var(--color-surface))}
[part~=copy]{min-inline-size:0}[part~=heading]{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:650}[part~=description]:empty{display:none}
[part~=actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px);flex:none}:host(:not([collapsible])) [part~=toggle]{display:none}
:host([collapsible]:not([expanded])) [part~=toggle]{rotate:-90deg}
`), header)
    }

    protected syncView(): void {
        if (!this.heading || !this.descriptionNode || !this.toggleButton) return
        this.heading.textContent = scalarText(this.label)
        this.descriptionNode.textContent = scalarText(this.description)
        this.toggleButton.hidden = !this.isCollapsible()
        this.toggleButton.disabled = this.unavailable
        this.toggleButton.setAttribute('aria-expanded', String(this.isExpanded()))
        actionLabel(this.toggleButton, this.toggleText())
        this.toggleAttribute('collapsible', this.isCollapsible())
        this.toggleAttribute('expanded', this.isExpanded())
    }
}

register('cb-panel-header', PanelHeader)
export { PanelHeaderBase }
export type { PanelHeaderProps } from './PanelHeaderBase.js'
