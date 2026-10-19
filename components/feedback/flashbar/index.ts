import { is, and, css as componentStyles, type Template, html, repeat, state, when } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { FlashbarBase, type NormalizedFlashbarMessage } from './FlashbarBase.js';
const css=editorCSS+`
:host{position:fixed;z-index:var(--z-index-flashbar,90);inset-block-start:var(--spacing-lg,16px);inset-inline-end:var(--spacing-lg,16px);display:block;inline-size:min(400px,calc(100vw - 32px));pointer-events:none}
:host([data-position=top-start]){inset-inline-start:var(--spacing-lg,16px);inset-inline-end:auto}:host([data-position=bottom-start]){inset-block-start:auto;inset-block-end:var(--spacing-lg,16px);inset-inline-start:var(--spacing-lg,16px);inset-inline-end:auto}:host([data-position=bottom-end]){inset-block-start:auto;inset-block-end:var(--spacing-lg,16px)}
[part=region]{display:flex;flex-direction:column;gap:var(--spacing-sm,8px)}[part=message]{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:var(--spacing-sm,8px);align-items:start;padding:var(--spacing-md,12px);pointer-events:auto;border:1px solid var(--color-separator,#dae0e4);border-inline-start:3px solid var(--color-signal-text,#1d50b3);border-radius:var(--radius-md,10px);background:var(--color-surface-raised,#fff);box-shadow:0 12px 36px rgba(12,18,24,.16);animation:cb-flash-in var(--motion-duration-normal,160ms) ease-out}
[part=message][data-type=success]{border-inline-start-color:var(--color-success,#08764f)}[part=message][data-type=warning]{border-inline-start-color:var(--color-warning,#855700)}[part=message][data-type=danger]{border-inline-start-color:var(--color-danger,#b4233c)}
[part~=message-icon]{inline-size:18px;block-size:18px;color:var(--color-signal-text,#1d50b3)}[data-type=success] [part~=message-icon]{color:var(--color-success,#08764f)}[data-type=warning] [part~=message-icon]{color:var(--color-warning,#855700)}[data-type=danger] [part~=message-icon]{color:var(--color-danger,#b4233c)}[data-type=loading] [part~=message-icon]{animation:cb-spin 1s linear infinite}
[part=heading]{font-weight:650}[part=content]{min-inline-size:0}[part=message-text]{margin:2px 0 0;color:var(--color-muted-foreground,#606b73)}[part=message-actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px)}
@keyframes cb-flash-in{from{opacity:0;translate:12px 0}}@keyframes cb-spin{to{rotate:1turn}}@media(max-width:480px){:host{inset-inline:8px;inline-size:auto}}
`;
const typeIcon: Readonly<Record<NormalizedFlashbarMessage['type'], string>> = {
    info: 'info', success: 'check', warning: 'warning', danger: 'warning', loading: 'reset',
};
export class Flashbar extends FlashbarBase {
    stylesheet = componentStyles`${css}`

    private readonly visibleMessages = state<readonly NormalizedFlashbarMessage[]>([]);
    render(): Template {
        return html`<section part="region" aria-label=${() => this.accessibleLabel || null}>
            ${repeat(this.visibleMessages[0], message => html`<article part="message" data-type=${message.type} data-id=${message.id}
                role=${message.type === 'danger' ? 'alert' : 'status'}
                onpointerenter=${() => this.pause(message.id)} onpointerleave=${() => this.resume(message.id)}
                onfocus=${[() => this.pause(message.id), true]} onblur=${[(event: FocusEvent) => {
                    if (!(event.currentTarget instanceof HTMLElement) || !(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) this.resume(message.id);
                }, true]}>
                <cb-icon part="message-icon icon" name=${typeIcon[message.type]} decorative></cb-icon>
                <div part="content">${when(is(message.heading), () => html`<div part="heading">${message.heading}</div>`)}
                    <p part="message-text">${message.message}</p></div>
                <div part="message-actions">
                    ${when(is(message.actionLabel), when(message.actionHref, () => html`<cb-link part="action" label=${message.actionLabel} accessible-label=${message.actionLabel}
                            href=${message.actionHref} target=${message.actionTarget} size="xs"
                            onnavigate=${(event: Event) => { event.stopPropagation(); void this.action(message,event); }}></cb-link>`, () => html`<cb-button part="action" exportparts="control:action-control,label:action-label,button-label:action-label,icon:action-icon,description:action-description" label=${message.actionLabel} accessible-label=${message.actionLabel} size="xs"
                            loading=${message.actionLoading} onaction=${(event: Event) => { event.stopPropagation(); void this.action(message,event); }}></cb-button>`))}
                    ${when(and(message.dismissible, is(message.dismissLabel)), () => html`<cb-button part="dismiss" exportparts="control:dismiss-control,label:dismiss-label,button-label:dismiss-label,icon:dismiss-icon,description:dismiss-description" icon-only icon="close" variant="ghost" size="xs"
                        accessible-label=${message.dismissLabel} onaction=${(event: Event) => { event.stopPropagation(); this.dismiss(message.id,'dismiss-button'); }}></cb-button>`)}
                </div></article>`, {key: message => message.id})}
        </section>`;
    }
    protected syncMessages(messages: readonly NormalizedFlashbarMessage[]): void { this.visibleMessages[1](messages); }
}
export { FlashbarBase };
export type { FlashbarProps, FlashbarMessage, NormalizedFlashbarMessage, FlashbarType, NormalizedFlashbarType, FlashbarPosition, FlashbarActionContext, FlashbarActionHandler } from './FlashbarBase.js';
export { showFlashbar, createFlashbar, updateFlashbar, hideFlashbar, clearFlashbars, configureFlashbarHost, getFlashbarHost } from './service.js';
export type { FlashbarHandle, FlashbarHostOptions } from './service.js';
