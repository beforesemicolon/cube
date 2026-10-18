import { editorCSS, el, fragment, sheet, slot, uid } from '../../core/editor-dom.js'
import { createIcon } from '../../icons/paths.js'

export interface ModalView {
    root: DocumentFragment
    dialog: HTMLDialogElement
    header: HTMLElement
    heading: HTMLSlotElement
    description: HTMLSlotElement
    close: HTMLButtonElement
    body: HTMLElement
    footer: HTMLElement
}

export const modalCSS = editorCSS + `
:host{display:contents}
[part~=dialog]{inline-size:min(calc(100vw - 32px),var(--component-modal-width,560px));max-inline-size:100%;max-block-size:min(88dvh,840px);margin:auto;padding:0;border:1px solid var(--color-separator,#dae0e4);border-radius:var(--component-modal-radius,var(--radius-lg,12px));background:var(--color-surface,#fff);color:var(--color-foreground,#20262b);box-shadow:var(--component-modal-shadow,0 24px 70px rgba(12,18,24,.24));overflow:hidden;opacity:0;translate:0 8px;transition:opacity var(--motion-duration-normal,160ms) ease-out,translate var(--motion-duration-normal,160ms) ease-out}
[part~=dialog][open]{opacity:1;translate:0 0}
[part~=dialog]::backdrop{background:var(--component-overlay-backdrop,rgba(10,16,22,.56));backdrop-filter:blur(var(--component-overlay-blur,1px))}
[part~=header]{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--spacing-md,12px);align-items:start;padding:var(--spacing-lg,16px);border-block-end:1px solid var(--color-separator,#dae0e4)}
[part~=heading]{font-size:var(--component-title-font-size,14px);font-weight:650;line-height:1.35}
[part~=description]{display:block;margin-block-start:var(--spacing-xs,4px);color:var(--color-muted-foreground,#606b73);font-size:var(--component-caption-font-size,11px)}
[part~=close]{inline-size:var(--component-control-height,28px);block-size:var(--component-control-height,28px);min-block-size:0;padding:5px;display:grid;place-items:center;background:transparent;border-color:transparent}
[part~=body]{padding:var(--spacing-lg,16px);overflow:auto;overscroll-behavior:contain}
[part~=footer]{display:flex;justify-content:flex-end;align-items:center;gap:var(--spacing-sm,8px);padding:var(--spacing-md,12px) var(--spacing-lg,16px);border-block-start:1px solid var(--color-separator,#dae0e4)}
[part~=confirm][data-destructive]{background:var(--color-danger,#b4233c);border-color:var(--color-danger,#b4233c);color:var(--color-danger-foreground,#fff)}
:host([modal-size=sm]) [part~=dialog]{--component-modal-width:400px}:host([modal-size=lg]) [part~=dialog]{--component-modal-width:800px}:host([modal-size=full]) [part~=dialog]{inline-size:calc(100vw - 32px);block-size:calc(100dvh - 32px)}
@media(max-width:520px){[part~=dialog]{inline-size:calc(100vw - 16px);max-block-size:calc(100dvh - 16px)}[part~=header],[part~=body]{padding:var(--spacing-md,12px)}}
`

export function createModalView(onClose: () => void, onCancel: (event: Event) => void, onClick: (event: MouseEvent) => void): ModalView {
    const dialog = el('dialog', 'dialog surface')
    const titleId = uid('cb-modal-title')
    const descriptionId = uid('cb-modal-description')
    dialog.setAttribute('aria-labelledby', titleId)
    dialog.setAttribute('aria-describedby', descriptionId)
    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('click', onClick)
    const header = el('header', 'header')
    const copy = el('div', 'header-copy')
    const heading = slot('heading', '', 'heading')
    heading.id = titleId
    const description = slot('description', '', 'description')
    description.id = descriptionId
    copy.append(heading, description)
    const close = el('button', 'close')
    close.type = 'button'
    close.append(createIcon('close'))
    close.addEventListener('click', onClose)
    header.append(copy, close)
    const body = el('section', 'body')
    body.append(slot('', '', 'content'))
    const footer = el('footer', 'footer actions')
    footer.append(slot('footer', '', 'footer-content'))
    dialog.append(header, body, footer)
    return { root: fragment(sheet(modalCSS), dialog), dialog, header, heading, description, close, body, footer }
}
