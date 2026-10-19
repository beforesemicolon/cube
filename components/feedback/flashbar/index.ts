import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { createIcon } from '../../icons/paths.js';
import { actionLabel, createButton, createIconButton } from '../../action/create.js';
import { scalarText } from '../../core/value.js';
import { FlashbarBase, type NormalizedFlashbarMessage } from './FlashbarBase.js';
import type { Link } from '../../navigation/link/index.js';
const typeIcon: Readonly<Record<NormalizedFlashbarMessage['type'], string>> = {
    info: 'info', success: 'check', warning: 'warning', danger: 'warning', loading: 'reset',
};
export class Flashbar extends FlashbarBase {
    private region?: HTMLElement;
    render(): Template {
        this.region = element('section', { attributes: { part: 'region' } }) as HTMLElement;
        const label = scalarText(this.accessibleLabel);
        if (label)
            this.region.setAttribute('aria-label', label);
        return html`<style part="styles">${editorCSS + `
:host{position:fixed;z-index:var(--z-index-flashbar,90);inset-block-start:var(--spacing-lg,16px);inset-inline-end:var(--spacing-lg,16px);display:block;inline-size:min(400px,calc(100vw - 32px));pointer-events:none}
:host([data-position=top-start]){inset-inline-start:var(--spacing-lg,16px);inset-inline-end:auto}:host([data-position=bottom-start]){inset-block-start:auto;inset-block-end:var(--spacing-lg,16px);inset-inline-start:var(--spacing-lg,16px);inset-inline-end:auto}:host([data-position=bottom-end]){inset-block-start:auto;inset-block-end:var(--spacing-lg,16px)}
[part=region]{display:flex;flex-direction:column;gap:var(--spacing-sm,8px)}[part=message]{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:var(--spacing-sm,8px);align-items:start;padding:var(--spacing-md,12px);pointer-events:auto;border:1px solid var(--color-separator,#dae0e4);border-inline-start:3px solid var(--color-signal-text,#1d50b3);border-radius:var(--radius-md,10px);background:var(--color-surface-raised,#fff);box-shadow:0 12px 36px rgba(12,18,24,.16);animation:cb-flash-in var(--motion-duration-normal,160ms) ease-out}
[part=message][data-type=success]{border-inline-start-color:var(--color-success,#08764f)}[part=message][data-type=warning]{border-inline-start-color:var(--color-warning,#855700)}[part=message][data-type=danger]{border-inline-start-color:var(--color-danger,#b4233c)}
[part~=message-icon]{inline-size:18px;block-size:18px;color:var(--color-signal-text,#1d50b3)}[data-type=success] [part~=message-icon]{color:var(--color-success,#08764f)}[data-type=warning] [part~=message-icon]{color:var(--color-warning,#855700)}[data-type=danger] [part~=message-icon]{color:var(--color-danger,#b4233c)}[data-type=loading] [part~=message-icon]{animation:cb-spin 1s linear infinite}
[part=heading]{font-weight:650}[part=content]{min-inline-size:0}[part=message-text]{margin:2px 0 0;color:var(--color-muted-foreground,#606b73)}[part=message-actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px)}
@keyframes cb-flash-in{from{opacity:0;translate:12px 0}}@keyframes cb-spin{to{rotate:1turn}}@media(max-width:480px){:host{inset-inline:8px;inline-size:auto}}
`}</style>${this.region}`;
    }
    protected syncMessages(messages: readonly NormalizedFlashbarMessage[]): void {
        if (!this.region)
            return;
        const label = scalarText(this.accessibleLabel);
        if (label)
            this.region.setAttribute('aria-label', label);
        else
            this.region.removeAttribute('aria-label');
        const focused = this.ownerDocument.activeElement;
        this.region.replaceChildren(...messages.map(message => this.messageNode(message)));
        if (focused instanceof HTMLElement && this.contains(focused))
            focused.focus();
    }
    private messageNode(message: NormalizedFlashbarMessage): HTMLElement {
        const article = element('article', { attributes: { part: 'message' } }) as HTMLElement;
        article.dataset.type = message.type;
        article.dataset.id = message.id;
        article.setAttribute('role', message.type === 'danger' ? 'alert' : 'status');
        article.addEventListener('pointerenter', () => this.pause(message.id));
        article.addEventListener('pointerleave', () => this.resume(message.id));
        article.addEventListener('focusin', () => this.pause(message.id));
        article.addEventListener('focusout', event => {
            if (!article.contains(event.relatedTarget as Node | null))
                this.resume(message.id);
        });
        article.append(createIcon(typeIcon[message.type], 'message-icon icon'));
        const content = element('div', { attributes: { part: 'content' } }) as HTMLDivElement;
        if (message.heading)
            content.append(element('div', { attributes: { part: 'heading' }, textContent: message.heading }) as HTMLDivElement);
        content.append(element('p', { attributes: { part: 'message-text' }, textContent: message.message }) as HTMLParagraphElement);
        const actions = element('div', { attributes: { part: 'message-actions' } }) as HTMLDivElement;
        if (message.actionLabel) {
            if (message.actionHref) {
                const action = document.createElement('cb-link') as Link;
                action.setAttribute('part', 'action');
                action.setAttribute('exportparts', 'control:action-control,label:action-label,icon:action-icon');
                Object.assign(action, { label: message.actionLabel, accessibleLabel: message.actionLabel, href: message.actionHref, target: message.actionTarget, size: 'xs' });
                action.addEventListener('navigate', event => { event.stopPropagation(); void this.action(message, event); });
                actions.append(action);
            }
            else {
                const action = createButton('action', event => { void this.action(message, event); });
                actionLabel(action, message.actionLabel);
                action.size = 'xs';
                action.loading = message.actionLoading;
                actions.append(action);
            }
        }
        if (message.dismissible && message.dismissLabel) {
            const dismiss = createIconButton('dismiss', 'close', () => this.dismiss(message.id, 'dismiss-button'));
            actionLabel(dismiss, message.dismissLabel);
            dismiss.size = 'xs';
            actions.append(dismiss);
        }
        article.append(content, actions);
        return article;
    }
}
export { FlashbarBase };
export type { FlashbarProps, FlashbarMessage, NormalizedFlashbarMessage, FlashbarType, NormalizedFlashbarType, FlashbarPosition, FlashbarActionContext, FlashbarActionHandler } from './FlashbarBase.js';
export { showFlashbar, createFlashbar, updateFlashbar, hideFlashbar, clearFlashbars, configureFlashbarHost, getFlashbarHost } from './service.js';
export type { FlashbarHandle, FlashbarHostOptions } from './service.js';
