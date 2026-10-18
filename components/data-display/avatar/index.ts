import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
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
`

export class Avatar extends AvatarBase {
    private rootNode?: HTMLElement
    private surfaceNode?: HTMLElement
    private imageNode?: HTMLImageElement
    private initialsNode?: HTMLElement
    private statusNode?: HTMLElement
    private imageFailed = false
    private renderedSource = ''

    render(): Node {
        this.rootNode = el('span', 'avatar root')
        this.surfaceNode = el('span', 'surface')
        this.imageNode = el('img', 'image')
        this.imageNode.alt = ''
        this.imageNode.decoding = 'async'
        this.imageNode.loading = 'lazy'
        this.initialsNode = el('span', 'initials')
        this.statusNode = el('span', 'status')
        this.statusNode.setAttribute('aria-hidden', 'true')
        this.imageNode.addEventListener('load', () => {
            if (!this.imageFailed) return
            this.imageFailed = false
            this.syncView()
        })
        this.imageNode.addEventListener('error', () => {
            this.imageFailed = true
            this.syncView()
        })
        this.surfaceNode.append(this.imageNode, this.initialsNode)
        this.rootNode.append(this.surfaceNode, this.statusNode)
        return fragment(sheet(css), this.rootNode)
    }

    protected syncView(): void {
        if (!this.rootNode || !this.surfaceNode || !this.imageNode || !this.initialsNode || !this.statusNode) return
        const source = this.avatarSource
        if (source !== this.renderedSource) {
            this.renderedSource = source
            this.imageFailed = false
            if (source) this.imageNode.src = source
            else this.imageNode.removeAttribute('src')
        }
        const showsImage = Boolean(source) && !this.imageFailed
        this.imageNode.hidden = !showsImage
        this.initialsNode.hidden = showsImage
        this.initialsNode.dataset.initials = this.avatarInitials
        const status = this.avatarStatus
        this.statusNode.dataset.status = status
        this.statusNode.hidden = status === 'none'
        this.statusNode.title = this.avatarStatusLabel
        if (this.avatarColor) this.style.setProperty('--cb-avatar-color', this.avatarColor)
        else this.style.removeProperty('--cb-avatar-color')

        const decorative = this.avatarDecorative
        aria(this, 'aria-hidden', decorative ? true : null)
        aria(this.rootNode, 'aria-hidden', decorative ? true : null)
        if (decorative) {
            this.rootNode.setAttribute('role', 'presentation')
            this.rootNode.removeAttribute('aria-label')
        } else if (this.avatarLabel) {
            this.rootNode.setAttribute('role', 'img')
            this.rootNode.setAttribute('aria-label', this.avatarLabel)
        } else {
            this.rootNode.removeAttribute('role')
            this.rootNode.removeAttribute('aria-label')
        }
    }
}

register('cb-avatar', Avatar)
export { AvatarBase }
export type { AvatarProps, AvatarStatus } from './AvatarBase.js'
