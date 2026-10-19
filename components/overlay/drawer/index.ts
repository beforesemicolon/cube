import { isNot, css as componentStyles, html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { uid } from '../../core/id.js'

import { DrawerBase } from './DrawerBase.js'
const css = editorCSS + `
:host{display:contents}[part~=dialog]{position:fixed;inset-block:0;inset-inline-start:auto;inline-size:min(var(--component-drawer-width,400px),calc(100vw - 24px));max-block-size:none;block-size:100dvh;margin:0;padding:0;border:0;border-inline-start:1px solid var(--color-separator);border-radius:0;background:var(--color-surface);color:var(--color-foreground);box-shadow:-16px 0 48px color-mix(in srgb,var(--color-foreground) 20%,transparent)}
:host([data-placement=start]) [part~=dialog]{inset-inline-start:0;inset-inline-end:auto;border-inline-start:0;border-inline-end:1px solid var(--color-separator);box-shadow:16px 0 48px color-mix(in srgb,var(--color-foreground) 20%,transparent)}
[part~=dialog]::backdrop{background:var(--component-overlay-backdrop,rgba(10,16,22,.48))}[part~=header]{display:flex;align-items:start;justify-content:space-between;gap:var(--spacing-md,12px);padding:var(--spacing-lg,16px);border-block-end:1px solid var(--color-separator)}[part~=heading]{display:block;font-weight:650}[part~=description]{display:block;margin-block-start:4px;color:var(--color-muted-foreground)}[part~=body]{padding:var(--spacing-lg,16px);overflow:auto}[part~=footer]{display:flex;justify-content:flex-end;gap:var(--spacing-sm,8px);padding:var(--spacing-md,12px) var(--spacing-lg,16px);border-block-start:1px solid var(--color-separator)}
`;
export class Drawer extends DrawerBase {
    stylesheet = componentStyles`${css}`

    private readonly headingId = uid('cb-drawer-heading')
    private readonly descriptionId = uid('cb-drawer-description')
    render(): Template {
        return html`
            <dialog ref="dialog" part="dialog drawer" aria-labelledby="${this.headingId}" aria-describedby="${this.descriptionId}"
                oncancel="${this.handleCancel}" onclick="${this.handleBackdrop}">

                <header part="header"><div part="copy">
                    <slot name="heading" part="heading" id="${this.headingId}">${this.props.heading}</slot>
                    <slot name="description" part="description" id="${this.descriptionId}" hidden="${isNot(this.props.description)}">${this.props.description}</slot>
                </div><cb-button part="close" exportparts="control:close-control,label:close-label,button-label:close-label,icon:close-icon,description:close-description" variant="ghost" icon="close" icon-only="true" hidden="${isNot(this.props.dismissible)}"
                    accessible-label="${this.closeText}" onaction="${(event: Event) => { event.stopPropagation(); this.dismiss('close-button', event) }}"></cb-button></header>
                <section part="body"><slot part="content"></slot></section>
                <footer part="footer"><slot name="footer" part="footer-content"></slot></footer>
            </dialog>`
    }
    protected dialogElement(): HTMLDialogElement | undefined { const node = this.refs.dialog?.[0]; return node instanceof HTMLDialogElement ? node : undefined }
    protected syncDialog(): void { this.dataset.placement = this.placement === 'start' ? 'start' : 'end' }
}
export { DrawerBase };
export type { DrawerProps } from './DrawerBase.js';
