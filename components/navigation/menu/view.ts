import type { MenuBase } from './MenuBase.js'
import { editorCSS, el, fragment, safeHref, sheet } from '../../core/editor-dom.js'
import { RovingFocus } from '../../core/roving.js'
import { createIcon, iconPaths } from '../../icons/paths.js'
import { bool } from '../../core/value.js'

export interface MenuView { root: DocumentFragment; menu: HTMLElement; update(): void; focusFirst(): void }

export const menuCSS = editorCSS + `
:host{display:block;min-inline-size:180px}[part=menu]{display:flex;flex-direction:column;gap:1px;padding:var(--spacing-xs,4px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface-raised,#fff);box-shadow:0 12px 32px rgba(12,18,24,.16);overflow:auto}
[part=item]{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:var(--spacing-sm,8px);inline-size:100%;min-block-size:28px;padding:4px 8px;border:0;background:transparent;text-align:start;white-space:nowrap}
[part=item]:hover:not(:disabled),[part=item]:focus-visible{background:var(--color-active,#e8ecee)}[part=item][aria-checked=true]{color:var(--color-signal-text,#1d50b3);background:var(--color-selection,#eaf1ff)}
[part=separator]{block-size:1px;margin:var(--spacing-xs,4px);background:var(--color-separator,#dae0e4)}[part=description]{grid-column:2/-1}[part=shortcut]{color:var(--color-muted-foreground,#606b73);font:500 10px/1 var(--typography-mono-font-family,ui-monospace,monospace)}[part=icon]{inline-size:14px;block-size:14px}
`

export function createMenuView(host: MenuBase, onActivate: (item: MenuBase['normalizedItems'][number], event: Event) => void): MenuView {
    const menu = el('div', 'menu')
    menu.setAttribute('role', 'menu')
    const roving = new RovingFocus(() => Array.from(menu.querySelectorAll<HTMLElement>('[role^=menuitem]:not([aria-disabled=true])')), () => 'vertical')
    menu.addEventListener('keydown', event => {
        roving.keydown(event)
        if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLElement && event.target.matches('[role^=menuitem]')) {
            event.preventDefault(); event.target.click()
        }
    })
    const update = (): void => {
        menu.setAttribute('aria-label', host.resolvedMenuLabel())
        menu.replaceChildren(...host.normalizedItems.map(item => {
            if (item.separator) return el('div', 'separator')
            const href = safeHref(item.href)
            const control = el(href ? 'a' : 'button', 'item')
            if (control instanceof HTMLButtonElement) control.type = 'button'; else control.href = href
            const role = item.type === 'checkbox' ? 'menuitemcheckbox' : item.type === 'radio' ? 'menuitemradio' : 'menuitem'
            control.setAttribute('role', role); control.dataset.label = item.label
            control.setAttribute('aria-disabled', String(bool(host.disabled) || item.disabled))
            if (role !== 'menuitem') control.setAttribute('aria-checked', String(Boolean(item.checked)))
            if (item.children?.length) control.setAttribute('aria-haspopup', 'menu')
            control.append(item.icon && Object.hasOwn(iconPaths, item.icon) ? createIcon(item.icon) : el('span', 'icon-spacer'))
            const copy = el('span', 'item-copy'); copy.append(el('span', 'item-label', item.label)); if (item.description) copy.append(el('span', 'description', item.description)); control.append(copy)
            if (item.shortcut) control.append(el('span', 'shortcut', item.shortcut)); else if (item.children?.length) control.append(createIcon('right'))
            control.addEventListener('click', event => {
                if (item.disabled || bool(host.disabled)) { event.preventDefault(); return }
                onActivate(item, event)
            })
            return control
        }))
        roving.reset(0)
    }
    return { root: fragment(sheet(menuCSS), menu), menu, update, focusFirst: () => menu.querySelector<HTMLElement>('[role^=menuitem]:not([aria-disabled=true])')?.focus() }
}
