import { type Template, html, repeat, when } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { PresenceBase } from './PresenceBase.js';
const css = editorCSS + `
:host{display:inline-block;max-inline-size:100%}
[part~=presence]{display:flex;align-items:center;gap:var(--spacing-sm,8px);min-block-size:var(--component-avatar-size-sm,32px);min-inline-size:0}
[part~=list]{display:flex;align-items:center;min-inline-size:0;margin:0;padding:0;list-style:none}
[part~=member]{position:relative;display:block;margin-inline-start:calc(0px - var(--component-presence-overlap,4px))}
[part~=member]:first-child{margin-inline-start:0}
[part~=participant]{display:block;inline-size:var(--component-avatar-size-sm,32px);block-size:var(--component-avatar-size-sm,32px);--component-button-min-width:var(--component-avatar-size-sm,32px)}
[part~=participant]::part(control){inline-size:100%;block-size:100%;min-inline-size:100%;min-block-size:100%;padding:0;border:0;border-radius:50%;background:transparent}
[part~=participant]::part(control):hover:not(:disabled),[part~=participant]::part(control):active:not(:disabled){background:transparent}
[part~=participant]:hover{position:relative;z-index:2}
[part~=participant]:focus-within{position:relative;z-index:3}
[part~=participant] cb-avatar{display:block;border-radius:50%;box-shadow:0 0 0 2px var(--color-surface);transition:box-shadow var(--motion-duration-fast) ease-out,transform var(--motion-duration-fast) ease-out}
[part~=participant] cb-avatar::part(surface){transition:filter var(--motion-duration-fast) ease-out}
[part~=participant]:hover cb-avatar{box-shadow:0 0 0 2px var(--color-surface),0 0 0 4px var(--color-active)}
[part~=participant]:hover cb-avatar::part(surface){filter:brightness(.94)}
[part~=participant]:active cb-avatar{transform:scale(.96)}
[part~=overflow-avatar]{--component-avatar-color:var(--color-selection);--component-avatar-foreground:var(--color-signal-text)}
[part~=summary]{min-inline-size:0;overflow:hidden;color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px);text-overflow:ellipsis;white-space:nowrap}
[part~=empty]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px)}
@media (forced-colors:active){[part~=participant] cb-avatar{box-shadow:0 0 0 1px Canvas}[part~=participant]:hover cb-avatar{box-shadow:0 0 0 2px Highlight}}
`;
export class Presence extends PresenceBase {
    render(): Template {
        return html`<style part="styles">${css}</style><div part="presence root" role="group" aria-label=${() => this.presenceLabel || null}>
            <ul part="list participants" hidden=${() => !this.presenceItems.length}>
                ${repeat(() => this.visibleItems, item => html`<li part="member">
                    <cb-button part="participant" exportparts="control:participant-control,label:participant-label,button-label:participant-label,icon:participant-icon,description:participant-description" disabled=${() => this.unavailable || item.disabled === true}
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
            <span part="summary" hidden=${() => !this.summaryText}>${() => this.summaryText}</span>
            <span part="empty" role="status" hidden=${() => Boolean(this.presenceItems.length) || !this.emptyText}>${() => this.emptyText}</span>
        </div>`;
    }
}
export { PresenceBase };
export type { PresenceItem, PresenceProps } from './PresenceBase.js';
