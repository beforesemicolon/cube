import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot, uid } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { actionLabel, createIconButton } from '../../action/create.js'
import type { Button } from '../../action/button/index.js'
import { DrawerBase } from './DrawerBase.js'

export class Drawer extends DrawerBase {
    private dialog?: HTMLDialogElement
    private headingNode?: HTMLSlotElement
    private descriptionNode?: HTMLSlotElement
    private closeButton?: Button
    render(): Node {
        this.dialog = el('dialog', 'dialog drawer')
        const headingId = uid('cb-drawer-heading')
        const descriptionId = uid('cb-drawer-description')
        this.dialog.setAttribute('aria-labelledby', headingId)
        this.dialog.setAttribute('aria-describedby', descriptionId)
        this.dialog.addEventListener('cancel', event => this.handleCancel(event))
        this.dialog.addEventListener('click', event => this.handleBackdrop(event))
        const header = el('header', 'header')
        const copy = el('div', 'copy')
        this.headingNode = slot('heading', '', 'heading'); this.headingNode.id = headingId
        this.descriptionNode = slot('description', '', 'description'); this.descriptionNode.id = descriptionId
        copy.append(this.headingNode, this.descriptionNode)
        this.closeButton = createIconButton('close', 'close', event => { this.dismiss('close-button', event) })
        header.append(copy, this.closeButton)
        const body = el('section', 'body'); body.append(slot('', '', 'content'))
        const footer = el('footer', 'footer'); footer.append(slot('footer', '', 'footer-content'))
        this.dialog.append(header, body, footer)
        return fragment(sheet(editorCSS + `
:host{display:contents}[part~=dialog]{position:fixed;inset-block:0;inset-inline-start:auto;inline-size:min(var(--component-drawer-width,400px),calc(100vw - 24px));max-block-size:none;block-size:100dvh;margin:0;padding:0;border:0;border-inline-start:1px solid var(--color-separator);border-radius:0;background:var(--color-surface);color:var(--color-foreground);box-shadow:-16px 0 48px color-mix(in srgb,var(--color-foreground) 20%,transparent)}
:host([data-placement=start]) [part~=dialog]{inset-inline-start:0;inset-inline-end:auto;border-inline-start:0;border-inline-end:1px solid var(--color-separator);box-shadow:16px 0 48px color-mix(in srgb,var(--color-foreground) 20%,transparent)}
[part~=dialog]::backdrop{background:var(--component-overlay-backdrop,rgba(10,16,22,.48))}[part~=header]{display:flex;align-items:start;justify-content:space-between;gap:var(--spacing-md,12px);padding:var(--spacing-lg,16px);border-block-end:1px solid var(--color-separator)}[part~=heading]{display:block;font-weight:650}[part~=description]{display:block;margin-block-start:4px;color:var(--color-muted-foreground)}[part~=body]{padding:var(--spacing-lg,16px);overflow:auto}[part~=footer]{display:flex;justify-content:flex-end;gap:var(--spacing-sm,8px);padding:var(--spacing-md,12px) var(--spacing-lg,16px);border-block-start:1px solid var(--color-separator)}
`), this.dialog)
    }
    protected dialogElement(): HTMLDialogElement | undefined { return this.dialog }
    protected syncDialog(): void {
        if (!this.dialog || !this.headingNode || !this.descriptionNode || !this.closeButton) return
        this.dataset.placement = this.placement === 'start' ? 'start' : 'end'
        this.headingNode.textContent = scalarText(this.heading)
        this.descriptionNode.textContent = scalarText(this.description)
        this.descriptionNode.hidden = !scalarText(this.description)
        this.closeButton.hidden = !bool(this.dismissible)
        actionLabel(this.closeButton, this.closeText())
    }
}

register('cb-drawer', Drawer)
export { DrawerBase }
export type { DrawerProps } from './DrawerBase.js'
