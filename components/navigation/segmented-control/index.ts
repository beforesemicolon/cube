import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { elementRefs } from '../../core/refs.js'
import {
    when,
    is,
    or,
    html,
    repeat,
    type Template,
} from '../../core/runtime.js'

import { RovingFocus } from '../../core/roving.js'
import { bool, scalarText } from '../../core/value.js'
import { SegmentedControlBase } from './SegmentedControlBase.js'

export class SegmentedControl extends SegmentedControlBase {
    stylesheet = componentStylesheet

    private readonly roving = new RovingFocus(
        () =>
            elementRefs(this.refs.items).filter(
                (node) => !node.hasAttribute('disabled')
            ),
        () => this.navigationAxis
    )
    private selected(): string {
        return bool(this.multiple)
            ? this.selectedValues()[0] || ''
            : this.choices.some((item) => item.id === scalarText(this.value))
              ? scalarText(this.value)
              : bool(this.allowEmpty)
                ? ''
                : (this.choices.find((item) => !item.disabled)?.id ?? '')
    }
    private checked(id: string): boolean {
        return bool(this.multiple)
            ? this.selectedValues().includes(id)
            : id === this.selected()
    }
    private focusable(): string {
        return (
            this.selected() ||
            this.choices.find((item) => !item.disabled)?.id ||
            ''
        )
    }
    render(): Template {
        return html` <div
            part="group"
            role="${() => (bool(this.multiple) ? 'group' : 'radiogroup')}"
            aria-orientation="${() => this.navigationAxis}"
            aria-label="${this.accessibleName}"
            onkeydown="${(event: KeyboardEvent) => this.roving.keydown(event)}"
        >
            ${repeat(
                () => this.choices,
                (item) => {
                    const choice = html`<cb-tooltip
                        content="${() => item.shortcut || bool(this.iconOnly) || Boolean(scalarText(this.iconOnlyAt)) ? [item.label, item.description].filter(Boolean).join(' — ') : ''}"
                        shortcut="${item.shortcut || ''}"
                        ><cb-button
                            ref="items"
                            part="item"
                            exportparts="control:item-control,label:item-label,button-label:item-label,icon:item-icon,description:item-description"
                            data-bare
                            data-semantic-host
                            size="${this.props.size}"
                            role="${() => (bool(this.multiple) ? 'checkbox' : 'radio')}"
                            data-label="${item.label}"
                            label="${item.label}"
                            accessible-label="${item.label}"
                            aria-description="${item.description || null}"
                            aria-keyshortcuts="${item.shortcut || null}"
                            icon-only="${this.props.iconOnly}"
                            icon="${item.icon ?? ''}"
                            icon-src=${item.iconSrc}
                            disabled="${or(() => this.unavailable, item.disabled)}"
                            aria-checked="${when(
                                is(() => this.checked(item.id)),
                                'true',
                                'false'
                            )}"
                            tabindex="${() => (item.id === this.focusable() ? 0 : -1)}"
                            onbeforeaction="${(event: Event) => event.stopPropagation()}"
                            onaction="${(event: Event) => this.choose(item, event)}"
                        ></cb-button
                    ></cb-tooltip>`
                    return this.items.find(candidate => scalarText(candidate.id) === item.id)?.closable
                        ? html`<div part="segment" data-selected="${() => this.checked(item.id)}">
                            ${choice}
                            <cb-button part="close" icon="close" icon-only="true" variant="ghost" size="xs"
                                accessible-label="${() => scalarText(this.closeLabel).replaceAll('{item}', item.label)}"
                                disabled="${or(() => this.unavailable, item.disabled)}"
                                onkeydown="${(event: KeyboardEvent) => event.stopPropagation()}"
                                onbeforeaction="${(event: Event) => event.stopPropagation()}"
                                onaction="${(event: Event) => this.closeSegment(item, event)}"></cb-button>
                        </div>` : choice
                },
                { key: (item) => item.id }
            )}
        </div>`
    }
    protected syncView(): void {
        if (bool(this.multiple)) {
            if (!bool(this.allowEmpty) && !this.selectedValues().length) {
                const first = this.choices.find((item) => !item.disabled)
                if (first) this.values = [first.id]
            }
        } else if (!scalarText(this.value) && this.selected())
            this.value = this.selected()
        this.toggleAttribute('data-stacked', this.navigationAxis === 'vertical')
        const breakpoint = this.normalizedIconOnlyBreakpoint
        if (breakpoint) this.dataset.iconOnlyAt = breakpoint
        else delete this.dataset.iconOnlyAt
    }
}
export { SegmentedControlBase }
export type {
    SegmentedControlProps,
    SegmentedItem,
    IconOnlyBreakpoint,
} from './SegmentedControlBase.js'

register('cb-segmented-control', SegmentedControl)
