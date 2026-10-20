import { elementRefs } from '../../core/refs.js'
import { when, or, html, repeat, type Template } from '../../core/runtime.js'

import { safeHref } from '../../core/url.js'
import { RovingFocus } from '../../core/roving.js'
import { bool } from '../../core/value.js'
import type { MenuBase } from './MenuBase.js'
export interface MenuView {
    root: Template
    menu?: HTMLElement
    update(): void
    focusFirst(): void
}

export function createMenuView(host: MenuBase, onActivate: (item: MenuBase['normalizedItems'][number], event: Event) => void): MenuView {
    const controls = () => elementRefs(root.refs.items).filter(node => !node.hasAttribute('data-disabled'))
    const roving = new RovingFocus(controls, () => 'vertical')
    const root = html`
        <div ref="menu" part="menu" role="menu" aria-label="${host.resolvedMenuLabel}"
            onkeydown="${(event: KeyboardEvent) => roving.keydown(event)}">
            ${repeat(() => host.normalizedItems, item => {
                if (item.separator) return html`<div part="separator"></div>`
                const href = safeHref(item.href)
                const role = item.type === 'checkbox' ? 'menuitemcheckbox' : item.type === 'radio' ? 'menuitemradio' : 'menuitem'
                const content = html`<cb-icon part="icon" name="${item.icon ?? ''}" decorative="true" hidden="${!item.icon}"></cb-icon>
                    ${when(!item.icon, () => html`<span part="icon-spacer"></span>`, () => '')}
                    <span part="item-copy"><span part="item-label">${item.label}</span>
                        ${when(item.description, () => html`<span part="description">${item.description}</span>`, () => '')}</span>
                    ${when(item.shortcut, () => html`<span part="shortcut">${item.shortcut}</span>`, () => when(item.children?.length, () => html`<cb-icon name="right" decorative="true"></cb-icon>`, () => ''))}`
                const checked = () => role === 'menuitem' ? null : String(Boolean(item.checked))
                return html`${when(href, () => html`<cb-link part="item" exportparts="control:item-control,label:item-label" data-bare
                    ref="items" data-menu-role="${role}" data-label="${item.label}" role="${role}" href="${href}"
                    accessible-label="${item.label}" disabled="${or(() => bool(host.disabled), item.disabled)}"
                    aria-checked="${checked}" aria-haspopup="${item.children?.length ? 'menu' : null}"
                    data-checked="${item.checked ? '' : null}"
                    onnavigate="${(event: CustomEvent<{ originalEvent: Event }>) => { event.stopPropagation(); onActivate(item, event.detail.originalEvent) }}">${content}</cb-link>`, () => html`<cb-button part="item" exportparts="control:item-control,button-label:item-label" data-bare data-semantic-host
                        ref="items" data-menu-role="${role}" data-label="${item.label}" role="${role}"
                        accessible-label="${item.label}" disabled="${or(() => bool(host.disabled), item.disabled)}"
                        aria-checked="${checked}" aria-haspopup="${item.children?.length ? 'menu' : null}"
                        data-checked="${item.checked ? '' : null}"
                        onaction="${(event: Event) => { event.stopPropagation(); onActivate(item, event) }}">${content}</cb-button>`)}`
            }, { key: item => item.id })}
        </div>`
    root.onMount(() => roving.reset()).onUpdate(() => roving.reset())
    return {
        root,
        get menu() { const node = root.refs.menu?.[0]; return node instanceof HTMLElement ? node : undefined },
        update() {},
        focusFirst: () => controls()[0]?.focus(),
    }
}
