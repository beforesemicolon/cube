import { isNot, is, css as componentStyles, html, state, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { AvatarBase } from './AvatarBase.js'
const css = editorCSS + `
:host{
    --cb-avatar-size:var(--component-avatar-size,var(--component-avatar-size-sm,32px));
    --cb-avatar-color:var(--component-avatar-color,var(--color-selection));
    --cb-avatar-foreground:var(--component-avatar-foreground,var(--color-signal-text));
    display:inline-grid;place-items:center;inline-size:var(--cb-avatar-size);block-size:var(--cb-avatar-size);
    min-inline-size:var(--cb-avatar-size);min-block-size:var(--cb-avatar-size);vertical-align:middle
}
:host([data-size=xs]){--cb-avatar-size:var(--component-avatar-size-xs,24px)}
:host([data-size=sm]){--cb-avatar-size:var(--component-avatar-size-sm,32px)}
:host([data-size=md]){--cb-avatar-size:var(--component-avatar-size-md,40px)}
:host([data-size=lg]){--cb-avatar-size:var(--component-avatar-size-lg,48px)}
[part~=avatar]{position:relative;display:grid;place-items:center;inline-size:100%;block-size:100%;overflow:visible}
[part~=surface]{position:relative;display:grid;place-items:center;inline-size:100%;block-size:100%;overflow:hidden;border:1px solid color-mix(in srgb,var(--cb-avatar-color) 72%,var(--color-border));border-radius:50%;background:var(--cb-avatar-color);color:var(--cb-avatar-foreground);font-weight:700;line-height:1;user-select:none}
[part~=initials]{font-size:max(9px,calc(var(--cb-avatar-size) * .36));letter-spacing:-.025em;text-transform:uppercase}
[part~=initials]::before{content:attr(data-initials)}
[part~=image]{display:block;inline-size:100%;block-size:100%;object-fit:cover}
[part~=status]{position:absolute;z-index:1;inset:auto 0 0 auto;inline-size:max(7px,calc(var(--cb-avatar-size) * .25));block-size:max(7px,calc(var(--cb-avatar-size) * .25));border:2px solid var(--color-surface);border-radius:50%;background:var(--color-muted-foreground)}
[part~=status][data-status=online]{background:var(--color-success)}
[part~=status][data-status=idle]{background:var(--color-warning)}
[part~=status][data-status=busy]{background:var(--color-danger)}
[part~=status][data-status=offline]{background:var(--color-muted-foreground)}
@media (forced-colors:active){[part~=surface]{border-color:CanvasText}[part~=status]{border-color:Canvas;background:CanvasText}}
`;
export class Avatar extends AvatarBase {
    stylesheet = componentStyles`${css}`

    private readonly failedSource = state('')
    render(): Template {
        const showsImage = () => Boolean(this.avatarSource) && this.failedSource[0]() !== this.avatarSource
        return html`
            <span part="avatar root" role="${() => this.avatarDecorative ? 'presentation' : this.avatarLabel ? 'img' : null}"
                aria-hidden="${() => this.avatarDecorative ? 'true' : null}"
                aria-label="${() => this.avatarDecorative ? null : this.avatarLabel || null}"
                style="${() => this.avatarColor ? '--cb-avatar-color:' + this.avatarColor : null}">
                <span part="surface">
                    <img part="image" alt="" decoding="async" loading="lazy" src="${() => this.avatarSource || null}" hidden="${isNot(showsImage)}"
                        onload="${() => this.failedSource[1]('')}" onerror="${() => this.failedSource[1](this.avatarSource)}">
                    <span part="initials" hidden="${showsImage}" data-initials="${() => this.avatarInitials}"></span>
                </span>
                <span part="status" aria-hidden="true" data-status="${() => this.avatarStatus}"
                    hidden="${is(() => this.avatarStatus, 'none')}" title="${() => this.avatarStatusLabel}"></span>
            </span>`
    }
    protected syncView(): void { this.toggleAttribute('aria-hidden', this.avatarDecorative) }
}
export { AvatarBase };
export type { AvatarProps, AvatarStatus } from './AvatarBase.js';
