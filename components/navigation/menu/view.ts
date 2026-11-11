import { elementRefs } from '../../core/refs.js'
import { when, or, html, repeat, type Template } from '../../core/runtime.js'

import { safeHref } from '../../core/url.js'
import { RovingFocus } from '../../core/roving.js'
import { bool, scalarText } from '../../core/value.js'
import type { MenuBase } from './MenuBase.js'
export interface MenuView {
    root: Template
    menu?: HTMLElement
    update(): void
    focusFirst(): void
}

export function createMenuView(
    host: MenuBase,
    onActivate: (
        item: MenuBase['normalizedItems'][number],
        event: Event
    ) => void
): MenuView {
    const controls = () =>
        elementRefs(root.refs.items).filter(
            (node) => !node.hasAttribute('data-disabled')
        )
    const roving = new RovingFocus(controls, () => 'vertical')
    const root = html` <div
        ref="menu"
        part="menu"
        role="menu"
        aria-label="${host.resolvedMenuLabel}"
        data-variant="${() => host.variant}"
        style="${() => `--component-menu-gap:${scalarText(host.gap) || '1px'}`}"
        onkeydown="${(event: KeyboardEvent) => roving.keydown(event)}"
    >
        ${repeat(
            () => host.normalizedItems,
            (item) => {
                if (item.separator) return html`<div part="separator"></div>`
                const href = safeHref(item.href)
                const role =
                    item.type === 'checkbox'
                        ? 'menuitemcheckbox'
                        : item.type === 'radio'
                          ? 'menuitemradio'
                          : 'menuitem'
                const tone = item.tone === 'danger' ? 'danger' : null
                if (typeof item.renderItem === 'function') {
                    const activateCustom = (event: Event): void => {
                        if (bool(host.disabled) || item.disabled) {
                            event.preventDefault()
                            event.stopPropagation()
                            return
                        }
                        onActivate(item, event)
                    }
                    return html`<div
                        part="custom-item"
                        ref="items"
                        role="${role}"
                        data-label="${item.label}"
                        aria-label="${item.label || null}"
                        aria-checked="${role === 'menuitem' ? null : String(Boolean(item.checked))}"
                        aria-disabled="${() => bool(host.disabled) || item.disabled ? 'true' : null}"
                        data-disabled="${() => bool(host.disabled) || item.disabled ? '' : null}"
                        data-active="${() => host.active === item.id ? '' : null}"
                        aria-current="${() => host.active === item.id ? 'true' : null}"
                        onclick="${activateCustom}"
                        onaction="${(event: Event) => event.stopPropagation()}"
                        onnavigate="${(event: Event) => event.stopPropagation()}"
                        onkeydown="${(event: KeyboardEvent) => {
                            if (event.target !== event.currentTarget) return
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                activateCustom(event)
                            }
                        }}"
                    >${() => item.renderItem?.(item)}</div>`
                }
                const content = html`<cb-icon
                        part="icon"
                        name="${item.icon ?? ''}"
                        src=${item.iconSrc}
                        decorative="true"
                        hidden="${!item.icon && !item.iconSrc}"
                    ></cb-icon>
                    ${when(
                        !item.icon && !item.iconSrc,
                        () => html`<span part="icon-spacer"></span>`,
                        () => ''
                    )}
                    <span part="item-copy"
                        ><span part="item-label">${item.label}</span> ${when(
                            item.description,
                            () =>
                                html`<span part="description"
                                    >${item.description}</span
                                >`,
                            () => ''
                        )}</span
                    >
                    ${when(
                        item.shortcut,
                        () =>
                            html`<span part="shortcut">${item.shortcut}</span>`,
                        () =>
                            when(
                                item.children?.length,
                                () =>
                                    html`<cb-icon
                                        name="right"
                                        decorative="true"
                                    ></cb-icon>`,
                                () => ''
                            )
                    )}`
                const checked = () =>
                    role === 'menuitem' ? null : String(Boolean(item.checked))
                return html`${when(
                    href,
                    () =>
                        html`<cb-link
                            part="item"
                            size="${host.props.size}"
                            exportparts="control:item-control,label:item-label"
                            data-bare
                            ref="items"
                            data-menu-role="${role}"
                            data-label="${item.label}"
                            role="${role}"
                            href="${href}"
                            data-tone="${tone}"
                            data-active="${() => host.active === item.id ? '' : null}"
                            aria-current="${() => host.active === item.id ? 'true' : null}"
                            accessible-label="${item.label}"
                            disabled="${or(() => bool(host.disabled), item.disabled)}"
                            aria-checked="${checked}"
                            aria-haspopup="${item.children?.length ? 'menu' : null}"
                            data-checked="${item.checked ? '' : null}"
                            onnavigate="${(
                                event: CustomEvent<{ originalEvent: Event }>
                            ) => {
                                event.stopPropagation()
                                onActivate(item, event.detail.originalEvent)
                            }}"
                            >${content}</cb-link
                        >`,
                    () =>
                        html`<cb-button
                            part="item"
                            size="${host.props.size}"
                            exportparts="control:item-control,button-label:item-label"
                            data-bare
                            data-semantic-host
                            ref="items"
                            data-menu-role="${role}"
                            data-label="${item.label}"
                            role="${role}"
                            data-tone="${tone}"
                            data-active="${() => host.active === item.id ? '' : null}"
                            aria-current="${() => host.active === item.id ? 'true' : null}"
                            accessible-label="${item.label}"
                            disabled="${or(() => bool(host.disabled), item.disabled)}"
                            aria-checked="${checked}"
                            aria-haspopup="${item.children?.length ? 'menu' : null}"
                            data-checked="${item.checked ? '' : null}"
                            onaction="${(event: Event) => {
                                event.stopPropagation()
                                onActivate(item, event)
                            }}"
                            >${content}</cb-button
                        >`
                )}`
            },
            { key: (item) => item.id }
        )}
    </div>`
    root.onMount(() => roving.reset()).onUpdate(() => roving.reset())
    return {
        root,
        get menu() {
            const node = root.refs.menu?.[0]
            return node instanceof HTMLElement ? node : undefined
        },
        update() {},
        focusFirst: () => controls()[0]?.focus(),
    }
}
