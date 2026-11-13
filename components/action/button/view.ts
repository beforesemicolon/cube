import { when, is, isNot, or, html, type Template } from '../../core/runtime.js'

import { aria } from '../../core/accessibility.js'
import { uid } from '../../core/id.js'
import { bool, scalarText } from '../../core/value.js'
import type { ButtonBase, ButtonProps } from './ButtonBase.js'

export function buttonView<P extends ButtonProps>(
    host: ButtonBase<P>,
    activate: (event: Event) => void,
    tag: 'button' | 'a' = 'button',
    link?: {
        href: () => string | null
        target: () => string
        download: () => string
    }
) {
    const semanticHost = host.hasAttribute('data-semantic-host')
    const descriptionId = uid('cb-button-help')
    const busy = is(host.props.loading)
    const content = html`<slot part="prefix" name="prefix"></slot>
        ${when(or(host.props.icon, host.props.iconSrc), html`<cb-icon part="icon" exportparts="path" name=${host.props.icon} src=${host.props.iconSrc} aria-hidden="true"></cb-icon>`)}
        <span part="spinner" hidden="${isNot(busy)}"></span>
        <span
            part="${() => (semanticHost ? 'button-label' : 'label') + (bool(host.iconOnly) ? ' sr-only' : '')}"
            ><slot part="content">${host.props.label}</slot></span
        >
        <slot part="suffix" name="suffix"></slot>
        <span
            part="indicator"
            aria-hidden="true"
            hidden="${isNot(host.props.indicator)}"
        ></span>`
    const onClick = (event: Event): void => {
        if (!semanticHost) activate(event)
    }
    const attributes = {
        role: () => (semanticHost ? 'none' : host.props.role?.() || null),
        'aria-hidden': () => (semanticHost ? 'true' : null),
        'aria-disabled': () =>
            tag === 'a' && host.controlUnavailable() ? true : null,
        'aria-busy': () => (busy() ? true : null),
        'aria-describedby': () =>
            scalarText(host.description) ? descriptionId : null,
        'aria-label': () =>
            semanticHost
                ? null
                : bool(host.iconOnly)
                  ? scalarText(host.accessibleLabel) || scalarText(host.label)
                  : scalarText(host.accessibleLabel) || null,
        'aria-haspopup': () =>
            semanticHost ? null : host.props.ariaHaspopup?.() || null,
        'aria-expanded': () =>
            semanticHost ? null : (host.props.ariaExpanded?.() ?? null),
        'aria-controls': () =>
            semanticHost ? null : host.props.ariaControls?.() || null,
        'aria-selected': () =>
            semanticHost ? null : (host.props.ariaSelected?.() ?? null),
        'aria-current': () =>
            semanticHost ? null : (host.props.ariaCurrent?.() ?? null),
        'aria-checked': () =>
            semanticHost ? null : (host.props.ariaChecked?.() ?? null),
        'aria-valuemin': () =>
            semanticHost ? null : (host.props.ariaValuemin?.() ?? null),
        'aria-valuemax': () =>
            semanticHost ? null : (host.props.ariaValuemax?.() ?? null),
        'aria-valuenow': () =>
            semanticHost ? null : (host.props.ariaValuenow?.() ?? null),
        'aria-valuetext': () =>
            semanticHost ? null : host.props.ariaValuetext?.() || null,
        'aria-description': () =>
            semanticHost
                ? null
                : host.props.ariaDescription?.() ||
                  (bool(host.indicator)
                      ? scalarText(host.indicatorLabel)
                      : null),
        'aria-keyshortcuts': () =>
            semanticHost ? null : host.props.ariaKeyshortcuts?.() || null,
        'aria-pressed': () =>
            host.pressed === undefined ? null : bool(host.pressed),
    }
    const surface =
        tag === 'a'
            ? html`<a
                  ref="control"
                  part="control"
                  ${attributes}
                  href="${() => (host.controlUnavailable() ? null : link?.href())}"
                  target="${() => link?.target()}"
                  rel="${() => (link?.target() === '_blank' ? 'noopener noreferrer' : null)}"
                  download="${() => link?.download() || null}"
                  tabindex="${when(or(semanticHost, host.controlUnavailable), -1, 0)}"
                  onclick="${onClick}"
                  >${content}</a
              >`
            : html`<button
                  ref="control"
                  part="control"
                  type="button"
                  ${attributes}
                  disabled="${or(semanticHost, host.controlUnavailable)}"
                  tabindex="${semanticHost ? -1 : null}"
                  onclick="${onClick}"
              >
                  ${content}
              </button>`
    const root: Template = html`${surface}
        <span
            part="description"
            id="${descriptionId}"
            hidden="${isNot(host.props.description)}"
            >${host.props.description}</span
        >`
    const control = (): HTMLButtonElement | HTMLAnchorElement | undefined => {
        const node = root.refs.control?.[0]
        return node instanceof HTMLButtonElement ||
            node instanceof HTMLAnchorElement
            ? node
            : undefined
    }
    const update = (): void => {
        const node = control()
        if (!node) return
        host.dataset.variant = [
            'primary',
            'secondary',
            'outline',
            'ghost',
            'destructive',
            'link',
        ].includes(host.variant ?? '')
            ? host.variant!
            : 'secondary'
        host.toggleAttribute('data-icon-only', bool(host.iconOnly))
        const iconOnlyAt = ['sm', 'md', 'lg'].includes(host.iconOnlyAt)
            ? host.iconOnlyAt
            : ''
        if (iconOnlyAt) host.dataset.iconOnlyAt = iconOnlyAt
        else delete host.dataset.iconOnlyAt
        host.toggleAttribute('data-wrap', bool(host.wrap))
        if (semanticHost) {
            if (!host.hasAttribute('tabindex'))
                host.tabIndex = host.controlUnavailable() ? -1 : 0
            aria(host, 'role', host.getAttribute('role') || 'button')
            aria(
                host,
                'aria-label',
                scalarText(host.accessibleLabel) ||
                    scalarText(host.label) ||
                    host.getAttribute('aria-label') ||
                    null
            )
            aria(host, 'aria-disabled', host.controlUnavailable() ? true : null)
        }
    }
    return {
        root,
        get control() {
            return control()
        },
        update,
    }
}
