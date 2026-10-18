import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet, slot, uid } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { FieldBase } from './FieldBase.js'

const css = editorCSS + `
:host{display:grid;inline-size:min(100%,var(--component-field-width,360px));min-inline-size:0}
[part~=field]{display:grid;gap:var(--spacing-xs,4px);min-inline-size:0}
[part~=header]{display:flex;align-items:baseline;justify-content:space-between;gap:var(--spacing-sm,8px);min-inline-size:0}
[part~=label-wrap]{display:flex;align-items:baseline;gap:var(--spacing-xs,4px);min-inline-size:0}
[part~=label]{font-weight:600}[part~=requirement]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px)}
[part~=control]{display:block;min-inline-size:0}[part~=description],[part~=help],[part~=error]{margin:0}
[part~=details]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px)}
[part~=details-summary]{cursor:pointer;color:var(--color-signal-text)}[part~=details-copy]{margin-block:var(--spacing-xs,4px) 0}
:host([data-invalid]) [part~=field]{--color-border:var(--color-danger)}
`

export class Field extends FieldBase {
    private group?: HTMLElement
    private labelNode?: HTMLElement
    private requirementNode?: HTMLElement
    private descriptionNode?: HTMLElement
    private helpNode?: HTMLElement
    private detailsNode?: HTMLDetailsElement
    private detailsSummary?: HTMLElement
    private detailsCopy?: HTMLElement
    private errorNode?: HTMLElement

    render(): Node {
        this.group = el('div', 'field')
        this.group.setAttribute('role', 'group')
        const header = el('div', 'header')
        const labelWrap = el('div', 'label-wrap')
        this.labelNode = el('span', 'label')
        this.requirementNode = el('span', 'requirement')
        labelWrap.append(this.labelNode, this.requirementNode)
        header.append(labelWrap, slot('actions', '', 'actions'))
        const control = el('div', 'control')
        control.append(slot('', '', 'control-slot'))
        this.descriptionNode = el('p', 'description')
        this.helpNode = el('p', 'help')
        this.detailsNode = el('details', 'details')
        this.detailsSummary = el('summary', 'details-summary')
        this.detailsCopy = el('p', 'details-copy')
        this.detailsNode.append(this.detailsSummary, this.detailsCopy, slot('details', '', 'details-content'))
        this.errorNode = el('p', 'error')
        this.errorNode.setAttribute('role', 'alert')
        this.group.append(header, control, this.descriptionNode, this.helpNode, this.detailsNode, this.errorNode)
        return fragment(sheet(css), this.group)
    }

    protected syncView(): void {
        if (!this.group || !this.labelNode || !this.requirementNode || !this.descriptionNode || !this.helpNode || !this.detailsNode || !this.detailsSummary || !this.detailsCopy || !this.errorNode) return
        const label = this.fieldLabel()
        const required = bool(this.required)
        const requirement = required ? '' : scalarText(this.optionalLabel)
        const description = scalarText(this.description)
        const help = this.fieldHelp()
        const details = this.fieldDetails()
        const detailsLabel = scalarText(this.detailsLabel)
        const error = this.fieldError()
        this.labelNode.textContent = label
        this.labelNode.hidden = !label
        this.requirementNode.textContent = requirement
        this.requirementNode.hidden = !requirement
        this.descriptionNode.textContent = description
        this.descriptionNode.hidden = !description
        this.helpNode.textContent = help
        this.helpNode.hidden = !help
        this.detailsSummary.textContent = detailsLabel
        this.detailsCopy.textContent = details
        this.detailsCopy.hidden = !details
        this.detailsNode.hidden = !detailsLabel && !details && !this.querySelector('[slot=details]')
        this.errorNode.textContent = error
        this.errorNode.hidden = !error
        this.toggleAttribute('data-invalid', this.isInvalid())
        const labelId = this.labelNode.id || uid('cb-field-label')
        this.labelNode.id = labelId
        const descriptionId = this.descriptionNode.id || uid('cb-field-description')
        this.descriptionNode.id = descriptionId
        const errorId = this.errorNode.id || uid('cb-field-error')
        this.errorNode.id = errorId
        aria(this.group, 'aria-labelledby', label ? labelId : null)
        aria(this.group, 'aria-describedby', [description ? descriptionId : '', error ? errorId : ''].filter(Boolean).join(' ') || null)
        aria(this.group, 'aria-invalid', this.isInvalid() ? true : null)
        aria(this.group, 'aria-disabled', this.unavailable ? true : null)
    }
}

register('cb-field', Field)
export { FieldBase }
export type { FieldProps } from './FieldBase.js'
