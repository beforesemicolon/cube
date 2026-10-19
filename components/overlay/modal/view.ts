import { element, html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { uid } from '../../core/id.js'
import { createIconButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
export interface ModalView {
    root: Template;
    dialog: HTMLDialogElement;
    header: HTMLElement;
    heading: HTMLSlotElement;
    description: HTMLSlotElement;
    close: Button;
    body: HTMLElement;
    footer: HTMLElement;
}
export const modalCSS = editorCSS + `
:host{display:contents}
:host([data-layer=document]){position:absolute;z-index:var(--z-index-modal,80);inset:0;display:grid;place-items:center;padding:var(--spacing-lg,16px);background:var(--component-overlay-backdrop,rgba(10,16,22,.56));backdrop-filter:blur(var(--component-overlay-blur,1px))}
[part~=dialog]{inline-size:min(calc(100vw - 32px),var(--component-modal-width,560px));max-inline-size:100%;max-block-size:min(88dvh,840px);margin:auto;padding:0;border:1px solid var(--color-separator,#dae0e4);border-radius:var(--component-modal-radius,var(--radius-lg,12px));background:var(--color-surface,#fff);color:var(--color-foreground,#20262b);box-shadow:var(--component-modal-shadow,0 24px 70px rgba(12,18,24,.24));overflow:hidden;opacity:0;translate:0 8px;transition:opacity var(--motion-duration-normal,160ms) ease-out,translate var(--motion-duration-normal,160ms) ease-out}
[part~=dialog][open]{opacity:1;translate:0 0}
[part~=dialog]::backdrop{background:var(--component-overlay-backdrop,rgba(10,16,22,.56));backdrop-filter:blur(var(--component-overlay-blur,1px))}
[part~=header]{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--spacing-md,12px);align-items:start;padding:var(--spacing-lg,16px);border-block-end:1px solid var(--color-separator,#dae0e4)}
[part~=heading]{font-size:var(--component-title-font-size,14px);font-weight:650;line-height:1.35}
[part~=description]{display:block;margin-block-start:var(--spacing-xs,4px);color:var(--color-muted-foreground,#606b73);font-size:var(--component-caption-font-size,11px)}
[part~=close]{align-self:start}
[part~=body]{padding:var(--spacing-lg,16px);overflow:auto;overscroll-behavior:contain}
[part~=footer]{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:var(--spacing-sm,8px);padding:var(--spacing-md,12px) var(--spacing-lg,16px);border-block-start:1px solid var(--color-separator,#dae0e4)}
[part~=footer-content]::slotted(*){display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:var(--spacing-sm,8px)}
:host([data-layer=document]) [part~=dialog]{position:relative;inset:auto;max-block-size:100%;margin:auto}
:host([modal-size=sm]) [part~=dialog]{--component-modal-width:400px}:host([modal-size=lg]) [part~=dialog]{--component-modal-width:800px}:host([modal-size=full]) [part~=dialog]{inline-size:calc(100vw - 32px);block-size:calc(100dvh - 32px)}
:host([modal-size=page]) [part~=dialog]{inline-size:min(calc(100vw - 32px),var(--component-modal-page-width,1120px));block-size:min(calc(100dvh - 32px),var(--component-modal-page-height,900px))}
@media(max-width:520px){[part~=dialog]{inline-size:calc(100vw - 16px);max-block-size:calc(100dvh - 16px)}[part~=header],[part~=body]{padding:var(--spacing-md,12px)}}
`;
export function createModalView(onClose: (event: Event) => void, onCancel: (event: Event) => void, onClick: (event: MouseEvent) => void): ModalView {
    const dialog = element('dialog', { attributes: { part: 'dialog surface' } }) as HTMLDialogElement;
    const titleId = uid('cb-modal-title');
    const descriptionId = uid('cb-modal-description');
    dialog.setAttribute('aria-labelledby', titleId);
    dialog.setAttribute('aria-describedby', descriptionId);
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('click', onClick);
    const header = element('header', { attributes: { part: 'header' } }) as HTMLElement;
    const copy = element('div', { attributes: { part: 'header-copy' } }) as HTMLDivElement;
    const heading = element("slot", { attributes: { name: 'heading', part: 'heading' }, textContent: '' }) as HTMLSlotElement;
    heading.id = titleId;
    const description = element("slot", { attributes: { name: 'description', part: 'description' }, textContent: '' }) as HTMLSlotElement;
    description.id = descriptionId;
    copy.append(heading, description);
    const close = createIconButton('close', 'close', onClose);
    header.append(copy, close);
    const body = element('section', { attributes: { part: 'body' } }) as HTMLElement;
    body.append(element("slot", { attributes: { name: '', part: 'content' }, textContent: '' }) as HTMLSlotElement);
    const footer = element('footer', { attributes: { part: 'footer actions' } }) as HTMLElement;
    footer.append(element("slot", { attributes: { name: 'footer', part: 'footer-content' }, textContent: '' }) as HTMLSlotElement);
    dialog.append(header, body, footer);
    return { root: html`<style part="styles">${modalCSS}</style>${dialog}`, dialog, header, heading, description, close, body, footer };
}
