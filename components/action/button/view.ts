import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { uid } from '../../core/id.js'
import { iconPaths } from '../../icons/registry.js'
import { bool, scalarText } from '../../core/value.js'
import type { ButtonBase, ButtonProps } from './ButtonBase.js'

export const buttonCSS = editorCSS + `
:host{display:inline-block}[part~=control]{display:inline-flex;align-items:center;justify-content:center;gap:var(--spacing-sm,8px);text-decoration:none;vertical-align:middle;max-inline-size:100%;font-weight:500;min-inline-size:var(--component-button-min-width,72px);border-start-start-radius:var(--component-button-radius-start-start,var(--radius-sm,6px));border-start-end-radius:var(--component-button-radius-start-end,var(--radius-sm,6px));border-end-end-radius:var(--component-button-radius-end-end,var(--radius-sm,6px));border-end-start-radius:var(--component-button-radius-end-start,var(--radius-sm,6px))}
:host([data-variant=primary]) [part~=control]{background:var(--color-primary,#2563EB);color:var(--color-primary-foreground,#fff);border-color:transparent}
:host([data-variant=primary]) [part~=control]:hover:not(:disabled):not([aria-disabled=true]){background:var(--color-primary-hover,#1D50B3)}
:host([data-variant=outline]) [part~=control]{background:transparent}
:host([data-variant=ghost]) [part~=control]{border-color:transparent;background:transparent}
:host([data-variant=ghost]) [part~=control]:hover:not(:disabled):not([aria-disabled=true]){background:var(--color-active,#E8ECEE)}
:host([data-icon-only]) [part~=control]{min-inline-size:var(--cb-height);padding-inline:var(--spacing-xs,4px)}
:host([data-variant=destructive]) [part~=control]{color:var(--color-danger,#B4233C);background:var(--color-danger-soft,#FFF0F2);border-color:var(--color-danger,#B4233C)}
:host([data-variant=secondary]) [part~=control][aria-pressed=true],:host([data-variant=outline]) [part~=control][aria-pressed=true]{background:var(--color-selection,#EAF1FF);color:var(--color-signal-text,#1D50B3);border-color:var(--color-primary,#2563EB)}
:host([data-variant=ghost]) [part~=control][aria-pressed=true]{background:var(--color-selection,#EAF1FF);color:var(--color-signal-text,#1D50B3);border-color:transparent}
:host([data-variant=primary]) [part~=control][aria-pressed=true]{background:var(--color-primary-hover,#1D50B3);color:var(--color-primary-foreground,#fff);border-color:transparent;box-shadow:inset 0 0 0 2px color-mix(in srgb,currentColor 38%,transparent)}
:host([data-variant=destructive]) [part~=control][aria-pressed=true]{background:var(--color-danger,#B4233C);color:var(--color-danger-foreground,#fff);border-color:var(--color-danger,#B4233C);box-shadow:inset 0 0 0 2px color-mix(in srgb,currentColor 38%,transparent)}
:host([data-bare]) [part~=control]{inline-size:100%;block-size:100%;min-inline-size:0;min-block-size:0;padding:0;border:0;border-radius:inherit;background:transparent;color:inherit;font:inherit;text-align:inherit;white-space:inherit}
:host([data-bare]) [part~=control]:hover:not(:disabled),:host([data-bare]) [part~=control]:active:not(:disabled){background:transparent}
:host([data-semantic-host]) [part~=control]{pointer-events:none;opacity:1}
[part~=spinner]{inline-size:var(--component-icon-size,16px);block-size:var(--component-icon-size,16px);border:2px solid currentColor;border-inline-end-color:transparent;border-radius:50%;animation:cb-spin .8s linear infinite}
[part~=label]{overflow:hidden;text-overflow:ellipsis}
[part~=description]{display:block;margin-block-start:var(--spacing-xs,4px)}
@keyframes cb-spin{to{transform:rotate(360deg)}}
`;

export function buttonView<P extends ButtonProps>(host: ButtonBase<P>, activate: (event: Event) => void, tag: 'button' | 'a' = 'button') {
    const semanticHost = host.hasAttribute('data-semantic-host')
    const descriptionId = uid('cb-button-help')
    const busy = () => bool(host.loading)
    const glyph = () => iconPaths[host.icon] ?? ''
    const content = html`<slot part="prefix" name="prefix"></slot>
        <svg part="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" hidden="${() => busy() || !glyph()}">
            <path part="path" d="${glyph}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <span part="spinner" hidden="${() => !busy()}"></span>
        <span part="${() => (semanticHost ? 'button-label' : 'label') + (bool(host.iconOnly) ? ' sr-only' : '')}"><slot part="content">${() => scalarText(host.label)}</slot></span>
        <slot part="suffix" name="suffix"></slot>`
    const onClick = (event: Event): void => { if (!semanticHost) activate(event) }
    const surface = tag === 'a'
        ? html`<a ref="control" part="control" onclick="${onClick}" style="padding:0;min-height:var(--cb-height);border:0;background:transparent;color:var(--color-signal-text,#1D50B3);text-decoration:underline;text-underline-offset:3px">${content}</a>`
        : html`<button ref="control" part="control" type="button" onclick="${onClick}">${content}</button>`
    const root: Template = html`<style>${buttonCSS}</style>${surface}
        <span part="description" id="${descriptionId}" hidden="${() => !scalarText(host.description)}">${() => scalarText(host.description)}</span>`
    const control = (): HTMLButtonElement | HTMLAnchorElement | undefined => {
        const node = root.refs.control?.[0]
        return node instanceof HTMLButtonElement || node instanceof HTMLAnchorElement ? node : undefined
    }
    const update = (): void => {
        const node = control()
        if (!node) return
        host.dataset.variant = ['primary', 'secondary', 'outline', 'ghost', 'destructive'].includes(host.variant ?? '') ? host.variant! : 'secondary'
        host.toggleAttribute('data-icon-only', bool(host.iconOnly))
        const disabled = host.hasAttribute('data-disabled')
        if (node instanceof HTMLButtonElement) node.disabled = semanticHost || disabled
        else { aria(node, 'aria-disabled', disabled ? true : null); node.tabIndex = disabled ? -1 : 0 }
        aria(node, 'aria-busy', busy() ? true : null)
        aria(node, 'aria-describedby', scalarText(host.description) ? descriptionId : null)
        if (semanticHost) {
            host.tabIndex = disabled ? -1 : 0
            aria(host, 'role', host.getAttribute('role') || 'button')
            aria(host, 'aria-label', scalarText(host.accessibleLabel) || scalarText(host.label) || null)
            aria(host, 'aria-disabled', disabled ? true : null)
            aria(node, 'role', 'none'); aria(node, 'aria-hidden', 'true'); node.tabIndex = -1
        } else {
            const forwarded = ['role', 'aria-haspopup', 'aria-expanded', 'aria-controls', 'aria-selected', 'aria-current', 'aria-checked', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext', 'aria-description', 'aria-keyshortcuts']
            for (const attribute of forwarded) aria(node, attribute, host.getAttribute(attribute) || null)
            aria(node, 'aria-label', bool(host.iconOnly) ? scalarText(host.accessibleLabel) || scalarText(host.label) : scalarText(host.accessibleLabel) || null)
        }
        host.applyControlAttributes(node)
        aria(node, 'aria-pressed', host.pressed === undefined ? null : bool(host.pressed))
    }
    return { root, get control() { return control() }, update }
}
