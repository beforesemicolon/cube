import { when, is, isNot, or, html, type Template } from '../../core/runtime.js'
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

export function buttonView<P extends ButtonProps>(host: ButtonBase<P>, activate: (event: Event) => void, tag: 'button' | 'a' = 'button', link?: {href:()=>string|null;target:()=>string;download:()=>string}) {
    const semanticHost = host.hasAttribute('data-semantic-host')
    const descriptionId = uid('cb-button-help')
    const busy = is(host.props.loading)
    const glyph = () => iconPaths[host.icon] ?? ''
    const content = html`<slot part="prefix" name="prefix"></slot>
        <svg part="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" hidden="${or(busy, isNot(glyph))}">
            <path part="path" d="${glyph}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <span part="spinner" hidden="${isNot(busy)}"></span>
        <span part="${() => (semanticHost ? 'button-label' : 'label') + (bool(host.iconOnly) ? ' sr-only' : '')}"><slot part="content">${host.props.label}</slot></span>
        <slot part="suffix" name="suffix"></slot>`
    const onClick = (event: Event): void => { if (!semanticHost) activate(event) }
    const attributes = {
        role: () => semanticHost ? 'none' : host.props.role?.() || null,
        'aria-hidden': () => semanticHost ? 'true' : null,
        'aria-disabled': () => tag === 'a' && host.controlUnavailable() ? true : null,
        'aria-busy': () => busy() ? true : null,
        'aria-describedby': () => scalarText(host.description) ? descriptionId : null,
        'aria-label': () => semanticHost ? null : bool(host.iconOnly) ? scalarText(host.accessibleLabel) || scalarText(host.label) : scalarText(host.accessibleLabel) || null,
        'aria-haspopup': () => semanticHost ? null : host.props.ariaHaspopup?.() || null,
        'aria-expanded': () => semanticHost ? null : host.props.ariaExpanded?.() ?? null,
        'aria-controls': () => semanticHost ? null : host.props.ariaControls?.() || null,
        'aria-selected': () => semanticHost ? null : host.props.ariaSelected?.() ?? null,
        'aria-current': () => semanticHost ? null : host.props.ariaCurrent?.() ?? null,
        'aria-checked': () => semanticHost ? null : host.props.ariaChecked?.() ?? null,
        'aria-valuemin': () => semanticHost ? null : host.props.ariaValuemin?.() ?? null,
        'aria-valuemax': () => semanticHost ? null : host.props.ariaValuemax?.() ?? null,
        'aria-valuenow': () => semanticHost ? null : host.props.ariaValuenow?.() ?? null,
        'aria-valuetext': () => semanticHost ? null : host.props.ariaValuetext?.() || null,
        'aria-description': () => semanticHost ? null : host.props.ariaDescription?.() || null,
        'aria-keyshortcuts': () => semanticHost ? null : host.props.ariaKeyshortcuts?.() || null,
        'aria-pressed': () => host.pressed === undefined ? null : bool(host.pressed),
    }
    const surface = tag === 'a'
        ? html`<a ref="control" part="control" ${attributes} href="${() => host.controlUnavailable() ? null : link?.href()}" target="${() => link?.target()}" rel="${() => link?.target() === '_blank' ? 'noopener noreferrer' : null}" download="${() => link?.download() || null}" tabindex="${when(or(semanticHost, host.controlUnavailable), -1, 0)}" onclick="${onClick}" style="padding:0;min-height:var(--cb-height);border:0;background:transparent;color:var(--color-signal-text,#1D50B3);text-decoration:underline;text-underline-offset:3px">${content}</a>`
        : html`<button ref="control" part="control" type="button" ${attributes} disabled="${or(semanticHost, host.controlUnavailable)}" tabindex="${semanticHost ? -1 : null}" onclick="${onClick}">${content}</button>`
    const root: Template = html`${surface}
        <span part="description" id="${descriptionId}" hidden="${isNot(host.props.description)}">${host.props.description}</span>`
    const control = (): HTMLButtonElement | HTMLAnchorElement | undefined => {
        const node = root.refs.control?.[0]
        return node instanceof HTMLButtonElement || node instanceof HTMLAnchorElement ? node : undefined
    }
    const update = (): void => {
        const node = control()
        if (!node) return
        host.dataset.variant = ['primary', 'secondary', 'outline', 'ghost', 'destructive'].includes(host.variant ?? '') ? host.variant! : 'secondary'
        host.toggleAttribute('data-icon-only', bool(host.iconOnly))
        if (semanticHost) {
            if (!host.hasAttribute('tabindex')) host.tabIndex = host.controlUnavailable() ? -1 : 0
            aria(host, 'role', host.getAttribute('role') || 'button')
            aria(host, 'aria-label', scalarText(host.accessibleLabel) || scalarText(host.label) || host.getAttribute('aria-label') || null)
            aria(host, 'aria-disabled', host.controlUnavailable() ? true : null)
        }
    }
    return { root, get control() { return control() }, update }
}
