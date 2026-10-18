import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { createIcon } from '../../icons/paths.js'
import { actionLabel, createButton, createIconButton } from '../../action/create.js'
import { scalarText } from '../../core/value.js'
import { FlashbarBase, type NormalizedFlashbarMessage } from './FlashbarBase.js'

const typeIcon: Readonly<Record<NormalizedFlashbarMessage['type'], string>> = {
    info: 'info', success: 'check', warning: 'warning', danger: 'warning', loading: 'reset',
}

export class Flashbar extends FlashbarBase {
    private region?: HTMLElement

    render(): Node {
        this.region = el('section', 'region')
        const label = scalarText(this.accessibleLabel)
        if (label) this.region.setAttribute('aria-label', label)
        return fragment(sheet(editorCSS + `
:host{position:fixed;z-index:var(--z-index-flashbar,90);inset-block-start:var(--spacing-lg,16px);inset-inline-end:var(--spacing-lg,16px);display:block;inline-size:min(400px,calc(100vw - 32px));pointer-events:none}
:host([data-position=top-start]){inset-inline-start:var(--spacing-lg,16px);inset-inline-end:auto}:host([data-position=bottom-start]){inset-block-start:auto;inset-block-end:var(--spacing-lg,16px);inset-inline-start:var(--spacing-lg,16px);inset-inline-end:auto}:host([data-position=bottom-end]){inset-block-start:auto;inset-block-end:var(--spacing-lg,16px)}
[part=region]{display:flex;flex-direction:column;gap:var(--spacing-sm,8px)}[part=message]{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:var(--spacing-sm,8px);align-items:start;padding:var(--spacing-md,12px);pointer-events:auto;border:1px solid var(--color-separator,#dae0e4);border-inline-start:3px solid var(--color-signal-text,#1d50b3);border-radius:var(--radius-md,10px);background:var(--color-surface-raised,#fff);box-shadow:0 12px 36px rgba(12,18,24,.16);animation:cb-flash-in var(--motion-duration-normal,160ms) ease-out}
[part=message][data-type=success]{border-inline-start-color:var(--color-success,#08764f)}[part=message][data-type=warning]{border-inline-start-color:var(--color-warning,#855700)}[part=message][data-type=danger]{border-inline-start-color:var(--color-danger,#b4233c)}
[part~=message-icon]{inline-size:18px;block-size:18px;color:var(--color-signal-text,#1d50b3)}[data-type=success] [part~=message-icon]{color:var(--color-success,#08764f)}[data-type=warning] [part~=message-icon]{color:var(--color-warning,#855700)}[data-type=danger] [part~=message-icon]{color:var(--color-danger,#b4233c)}[data-type=loading] [part~=message-icon]{animation:cb-spin 1s linear infinite}
[part=heading]{font-weight:650}[part=content]{min-inline-size:0}[part=message-text]{margin:2px 0 0;color:var(--color-muted-foreground,#606b73)}[part=message-actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px)}
@keyframes cb-flash-in{from{opacity:0;translate:12px 0}}@keyframes cb-spin{to{rotate:1turn}}@media(max-width:480px){:host{inset-inline:8px;inline-size:auto}}
`), this.region)
    }

    protected syncMessages(messages: readonly NormalizedFlashbarMessage[]): void {
        if (!this.region) return
        const label = scalarText(this.accessibleLabel)
        if (label) this.region.setAttribute('aria-label', label); else this.region.removeAttribute('aria-label')
        const focused = this.ownerDocument.activeElement
        this.region.replaceChildren(...messages.map(message => this.messageNode(message)))
        if (focused instanceof HTMLElement && this.contains(focused)) focused.focus()
    }

    private messageNode(message: NormalizedFlashbarMessage): HTMLElement {
        const article = el('article', 'message')
        article.dataset.type = message.type
        article.dataset.id = message.id
        article.setAttribute('role', message.type === 'danger' ? 'alert' : 'status')
        article.append(createIcon(typeIcon[message.type], 'message-icon icon'))
        const content = el('div', 'content')
        if (message.heading) content.append(el('div', 'heading', message.heading))
        content.append(el('p', 'message-text', message.message))
        const actions = el('div', 'message-actions')
        if (message.actionLabel) {
            const action = createButton('action', event => this.action(message, event))
            actionLabel(action, message.actionLabel)
            action.size = 'xs'
            actions.append(action)
        }
        if (message.dismissible && message.dismissLabel) {
            const dismiss = createIconButton('dismiss', 'close', () => this.dismiss(message.id, 'dismiss-button'))
            actionLabel(dismiss, message.dismissLabel)
            dismiss.size = 'xs'
            actions.append(dismiss)
        }
        article.append(content, actions)
        return article
    }
}

register('cb-flashbar', Flashbar)
export { FlashbarBase }
export type { FlashbarProps, FlashbarMessage, NormalizedFlashbarMessage, FlashbarType, FlashbarPosition } from './FlashbarBase.js'
export { showFlashbar, updateFlashbar, hideFlashbar, clearFlashbars } from './service.js'
