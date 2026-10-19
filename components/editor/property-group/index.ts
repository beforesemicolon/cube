import '../../data-display/expandable-section/index.js'
import type { ExpandableSection } from '../../data-display/expandable-section/index.js'
import { actionLabel, createIconButton } from '../../action/create.js'
import type { Button } from '../../action/button/index.js'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { PropertyGroupBase } from './PropertyGroupBase.js'

const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0}[part~=section]{display:block}[part~=mixed]{display:inline-flex;align-items:center;min-block-size:20px;padding:1px var(--spacing-xs,4px);border-radius:999px;background:var(--color-selection);color:var(--color-signal-text);font-size:10px}
[part~=reset]{flex:none}:host([data-dirty]) [part~=section]{--component-property-group-accent:var(--color-primary)}
`

export class PropertyGroup extends PropertyGroupBase {
    private section?: ExpandableSection
    private mixedNode?: HTMLElement
    private resetButton?: Button
    render(): Node {
        this.section = document.createElement('cb-expandable-section') as ExpandableSection
        this.section.setAttribute('part', 'section')
        this.section.setAttribute('exportparts', 'root:root,trigger:trigger,heading:heading,label:label,description:description,panel:panel,content:content,header-extras:header-extras')
        this.section.addEventListener('expansionchange', event => {
            event.stopPropagation()
            this.toggle(event)
        })
        this.mixedNode = el('span', 'mixed')
        this.mixedNode.slot = 'header-info'
        this.resetButton = createIconButton('reset', 'reset', event => this.reset(event))
        this.resetButton.slot = 'header-actions'
        this.section.append(this.mixedNode, this.resetButton, slot('', '', 'property-content'))
        return fragment(sheet(css), this.section)
    }
    protected syncView(): void {
        if (!this.section || !this.mixedNode || !this.resetButton) return
        Object.assign(this.section, {
            label: scalarText(this.label), accessibleLabel: scalarText(this.accessibleLabel) || this.toggleLabel(), description: scalarText(this.description),
            expanded: bool(this.expanded), disabled: this.unavailable || !bool(this.collapsible), headingLevel: 3,
        })
        this.mixedNode.textContent = scalarText(this.mixedLabel)
        this.mixedNode.hidden = !bool(this.mixed) || !scalarText(this.mixedLabel)
        actionLabel(this.resetButton, scalarText(this.resetLabel))
        this.resetButton.hidden = !bool(this.dirty)
        this.resetButton.disabled = this.unavailable
        this.toggleAttribute('data-dirty', bool(this.dirty))
        this.toggleAttribute('data-mixed', bool(this.mixed))
    }
}

register('cb-property-group', PropertyGroup)
export { PropertyGroupBase }
export type { PropertyGroupProps } from './PropertyGroupBase.js'
