import { html, repeat, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
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
export const menuCSS = editorCSS + `
:host{display:block;min-inline-size:180px}[part=menu]{display:flex;flex-direction:column;gap:1px;padding:var(--spacing-xs,4px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface-raised,#fff);box-shadow:0 12px 32px rgba(12,18,24,.16);overflow:auto}
[part=item]{display:block;inline-size:100%;min-block-size:28px;padding:0;border:0;background:transparent;text-align:start;white-space:nowrap}
[part=item]::part(control){display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:var(--spacing-sm,8px);inline-size:100%;padding:4px 8px;text-align:inherit;white-space:inherit}[part=item]::part(button-label){display:contents}
cb-link[part=item]::part(label){display:contents}
[part=item]:hover:not(:disabled),[part=item]:focus-visible{background:var(--color-active,#e8ecee)}[part=item][data-checked]{color:var(--color-signal-text,#1d50b3);background:var(--color-selection,#eaf1ff)}
[part=separator]{block-size:1px;margin:var(--spacing-xs,4px);background:var(--color-separator,#dae0e4)}[part=description]{grid-column:2/-1}[part=shortcut]{color:var(--color-muted-foreground,#606b73);font:500 10px/1 var(--typography-mono-font-family,ui-monospace,monospace)}[part=icon]{inline-size:14px;block-size:14px}
`;

export function createMenuView(host: MenuBase, onActivate: (item: MenuBase['normalizedItems'][number], event: Event) => void): MenuView {
    const controls = () => [...(root.refs.menu?.[0]?.querySelectorAll<HTMLElement>('[data-menu-role]:not([data-disabled])') ?? [])]
    const roving = new RovingFocus(controls, () => 'vertical')
    const root = html`<style part="styles">${menuCSS}</style>
        <div ref="menu" part="menu" role="menu" aria-label="${() => host.resolvedMenuLabel()}"
            onkeydown="${(event: KeyboardEvent) => roving.keydown(event)}">
            ${repeat(() => host.normalizedItems, item => {
                if (item.separator) return html`<div part="separator"></div>`
                const href = safeHref(item.href)
                const role = item.type === 'checkbox' ? 'menuitemcheckbox' : item.type === 'radio' ? 'menuitemradio' : 'menuitem'
                const content = html`<cb-icon part="icon" name="${item.icon ?? ''}" decorative="true" hidden="${!item.icon}"></cb-icon>
                    ${!item.icon ? html`<span part="icon-spacer"></span>` : ''}
                    <span part="item-copy"><span part="item-label">${item.label}</span>
                        ${item.description ? html`<span part="description">${item.description}</span>` : ''}</span>
                    ${item.shortcut ? html`<span part="shortcut">${item.shortcut}</span>` : item.children?.length ? html`<cb-icon name="right" decorative="true"></cb-icon>` : ''}`
                const checked = () => role === 'menuitem' ? null : String(Boolean(item.checked))
                return href ? html`<cb-link part="item" exportparts="control:item-control,label:item-label" data-bare
                    data-menu-role="${role}" data-label="${item.label}" role="${role}" href="${href}"
                    accessible-label="${item.label}" disabled="${() => bool(host.disabled) || item.disabled}"
                    aria-checked="${checked}" aria-haspopup="${item.children?.length ? 'menu' : null}"
                    data-checked="${item.checked ? '' : null}"
                    onnavigate="${(event: CustomEvent<{ originalEvent: Event }>) => { event.stopPropagation(); onActivate(item, event.detail.originalEvent) }}">${content}</cb-link>`
                    : html`<cb-button part="item" exportparts="control:item-control,button-label:item-label" data-bare data-semantic-host
                        data-menu-role="${role}" data-label="${item.label}" role="${role}"
                        accessible-label="${item.label}" disabled="${() => bool(host.disabled) || item.disabled}"
                        aria-checked="${checked}" aria-haspopup="${item.children?.length ? 'menu' : null}"
                        data-checked="${item.checked ? '' : null}"
                        onaction="${(event: Event) => { event.stopPropagation(); onActivate(item, event) }}">${content}</cb-button>`
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
