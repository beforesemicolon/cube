import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, is, or, type Template, html, repeat, when } from '../../core/runtime.js'

import { PresenceBase } from './PresenceBase.js';

export class Presence extends PresenceBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<div part="presence root" role="group" aria-label=${() => this.presenceLabel || null}>
            <ul part="list participants" hidden=${isNot(() => this.presenceItems.length)}>
                ${repeat(() => this.visibleItems, item => html`<li part="member">
                    <cb-button part="participant" exportparts="control:participant-control,label:participant-label,button-label:participant-label,icon:participant-icon,description:participant-description" disabled=${or(() => this.unavailable, is(item.disabled, true))}
                        value=${item.id} accessible-label=${() => item.accessibleLabel?.trim() || item.label}
                        onaction=${(event: Event) => { event.stopPropagation(); this.activate(item,event); }}>
                        <cb-avatar part="avatar" name=${() => item.label} src=${() => item.src ?? ''}
                            initials=${() => item.initials ?? ''} color=${() => item.color ?? ''}
                            status=${() => item.status ?? 'none'} status-label=${() => item.statusLabel ?? ''} size="sm" decorative></cb-avatar>
                    </cb-button></li>`, {key: item => item.id})}
                ${when(() => this.hiddenItems.length > 0, () => html`<li part="member overflow-member">
                    <cb-button part="participant overflow" exportparts="control:participant-control,label:participant-label,button-label:participant-label,icon:participant-icon,description:participant-description,control:overflow-control,label:overflow-label,button-label:overflow-label,icon:overflow-icon,description:overflow-description" disabled=${() => this.unavailable}
                        accessible-label=${() => this.overflowText(this.hiddenItems.length)}
                        onaction=${(event: Event) => { event.stopPropagation(); this.activateOverflow(event); }}>
                        <cb-avatar part="avatar overflow-avatar" initials=${() => `+${this.hiddenItems.length}`} size="sm" decorative></cb-avatar>
                    </cb-button></li>`)}
            </ul>
            <span part="summary" hidden=${isNot(() => this.summaryText)}>${() => this.summaryText}</span>
            <span part="empty" role="status" hidden=${or(is(() => this.presenceItems.length), isNot(() => this.emptyText))}>${() => this.emptyText}</span>
        </div>`;
    }
}
export { PresenceBase };
export type { PresenceItem, PresenceProps } from './PresenceBase.js';

register('cb-presence', Presence)
