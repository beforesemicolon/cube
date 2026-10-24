import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { is, and, type Template, html, repeat, state, when } from '../../core/runtime.js'

import { FlashbarBase, type NormalizedFlashbarMessage } from './FlashbarBase.js';

const typeIcon: Readonly<Record<NormalizedFlashbarMessage['type'], string>> = {
    info: 'info', success: 'check', warning: 'warning', danger: 'warning', loading: 'reset',
};
export class Flashbar extends FlashbarBase {
    stylesheet = componentStylesheet

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

register('cb-flashbar', Flashbar)
