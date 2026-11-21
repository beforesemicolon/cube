import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, is, html, state, type Template } from '../../core/runtime.js'

import { resolvedAvatarForeground, supportsNativeContrast } from './contrast.js'

import { AvatarBase } from './AvatarBase.js'

export class Avatar extends AvatarBase {
    stylesheet = componentStylesheet

    private readonly failedSource = state('')
    render(): Template {
        const showsImage = () => Boolean(this.avatarSource) && this.failedSource[0]() !== this.avatarSource
        return html`
            <span ref="avatar" part="avatar root" role="${() => this.avatarDecorative ? 'presentation' : this.avatarLabel ? 'img' : null}"
                aria-hidden="${() => this.avatarDecorative ? 'true' : null}"
                aria-label="${() => this.avatarDecorative ? null : this.avatarLabel || null}"
                data-variant="${() => this.variant === 'boxy' ? 'boxy' : 'round'}"
                data-color-index="${() => this.avatarColorIndex}"
                style="${() => this.avatarColor ? '--cb-avatar-color:' + this.avatarColor : null}">
                <span ref="surface" part="surface">
                    <img part="image" alt="" decoding="async" loading="lazy" src="${() => this.avatarSource || null}" hidden="${isNot(showsImage)}"
                        onload="${() => this.failedSource[1]('')}" onerror="${() => this.failedSource[1](this.avatarSource)}">
                    <span part="initials" hidden="${showsImage}" data-initials="${() => this.avatarInitials}"></span>
                </span>
                <span part="status" aria-hidden="true" data-status="${() => this.avatarStatus}"
                    hidden="${is(() => this.avatarStatus, 'none')}" title="${() => this.avatarStatusLabel}"></span>
            </span>`
    }
    private contrastPending = false
    protected mount(): void {
        super.mount()
        if (supportsNativeContrast(this.ownerDocument)) return
        this.listen(this.ownerDocument, 'themechange', () => this.syncView())
        const observer = new MutationObserver(() => this.syncView())
        observer.observe(this, { attributes: true, attributeFilter: ['style', 'class'] })
        this.cleanup(() => observer.disconnect())
    }
    protected syncView(): void {
        this.toggleAttribute('aria-hidden', this.avatarDecorative)
        if (supportsNativeContrast(this.ownerDocument) || this.contrastPending) return
        this.contrastPending = true
        queueMicrotask(() => {
            this.contrastPending = false
            if (!this.isConnected) return
            const surface = this.refs.surface?.[0]
            const avatar = this.refs.avatar?.[0]
            if (!(surface instanceof HTMLElement) || !(avatar instanceof HTMLElement)) return
            const foreground = resolvedAvatarForeground(surface)
            if (foreground) avatar.style.setProperty('--cb-avatar-auto-foreground', foreground)
        })
    }
}
export { AvatarBase };
export type { AvatarProps, AvatarStatus, AvatarVariant } from './AvatarBase.js';

register('cb-avatar', Avatar)
