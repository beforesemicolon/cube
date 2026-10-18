import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { actionLabel, createButton } from '../../action/create.js'
import type { Avatar } from '../../data-display/avatar/index.js'
import '../../data-display/avatar/index.js'
import { PresenceBase, type PresenceItem } from './PresenceBase.js'

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
`

function participantLabel(item: PresenceItem): string {
    return item.accessibleLabel?.trim() || item.label
}

function avatarFor(item: PresenceItem): Avatar {
    const avatar = document.createElement('cb-avatar') as Avatar
    avatar.setAttribute('part', 'avatar')
    avatar.name = item.label
    avatar.src = item.src ?? ''
    avatar.initials = item.initials ?? ''
    avatar.color = item.color ?? ''
    avatar.status = item.status ?? 'none'
    avatar.statusLabel = item.statusLabel ?? ''
    avatar.size = 'sm'
    avatar.decorative = true
    return avatar
}

export class Presence extends PresenceBase {
    private rootNode?: HTMLElement
    private listNode?: HTMLUListElement
    private summaryNode?: HTMLElement
    private emptyNode?: HTMLElement

    render(): Node {
        this.rootNode = el('div', 'presence root')
        this.listNode = el('ul', 'list participants')
        this.summaryNode = el('span', 'summary')
        this.emptyNode = el('span', 'empty')
        this.emptyNode.setAttribute('role', 'status')
        this.rootNode.append(this.listNode, this.summaryNode, this.emptyNode)
        return fragment(sheet(css), this.rootNode)
    }

    protected syncView(): void {
        if (!this.rootNode || !this.listNode || !this.summaryNode || !this.emptyNode) return
        this.listNode.replaceChildren()
        for (const item of this.visibleItems) {
            const member = el('li', 'member')
            const button = createButton('participant', event => this.activate(item, event))
            button.disabled = this.unavailable || item.disabled === true
            button.value = item.id
            actionLabel(button, participantLabel(item))
            button.append(avatarFor(item))
            member.append(button)
            this.listNode.append(member)
        }
        const hidden = this.hiddenItems.length
        if (hidden) {
            const member = el('li', 'member overflow-member')
            const button = createButton('participant', event => this.activateOverflow(event))
            button.setAttribute('part', 'participant overflow')
            button.disabled = this.unavailable
            actionLabel(button, this.overflowText(hidden))
            const avatar = document.createElement('cb-avatar') as Avatar
            avatar.setAttribute('part', 'avatar overflow-avatar')
            avatar.initials = `+${hidden}`
            avatar.size = 'sm'
            avatar.decorative = true
            button.append(avatar)
            member.append(button)
            this.listNode.append(member)
        }
        this.listNode.hidden = !this.presenceItems.length
        this.summaryNode.textContent = this.summaryText
        this.summaryNode.hidden = !this.summaryText
        this.emptyNode.textContent = this.emptyText
        this.emptyNode.hidden = Boolean(this.presenceItems.length) || !this.emptyText
        aria(this.rootNode, 'aria-label', this.presenceLabel || null)
        this.rootNode.setAttribute('role', 'group')
    }
}

register('cb-presence', Presence)
export { PresenceBase }
export type { PresenceItem, PresenceProps } from './PresenceBase.js'
