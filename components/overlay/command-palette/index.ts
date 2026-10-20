import componentStylesheet from './styles.css?inline'
import { isNot, or, html, type Template } from '../../core/runtime.js'

import { bool, scalarText } from '../../core/value.js'
import type { NormalizedItem } from '../../core/items.js'
import { CommandPaletteBase } from './CommandPaletteBase.js'

export class CommandPalette extends CommandPaletteBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`
            <dialog ref="dialog" part="dialog" oncancel="${(event: Event) => { event.preventDefault(); event.stopPropagation(); this.close() }}">
                <label part="search"><cb-icon part="icon" name="search" decorative="true"></cb-icon>
                    <cb-text-input ref="input" part="input" exportparts="control:input-control"
                        placeholder="${this.props.placeholder}" accessible-label="${this.accessibleName}" value="${this.props.query}"
                        onchange="${(event: CustomEvent<{ value: string }>) => { event.stopPropagation(); this.query = scalarText(event.detail.value) }}"></cb-text-input>
                </label>
                <cb-menu part="results" items="${() => this.results}" accessible-label="${this.accessibleName}"
                    onaction="${(event: CustomEvent<{ item: NormalizedItem }>) => { event.stopPropagation(); if (event.detail.item) this.select(event.detail.item, event) }}"></cb-menu>
                <p part="empty" hidden="${or(() => this.results.length > 0, isNot(this.props.emptyLabel))}">${this.props.emptyLabel}</p>
            </dialog>`
    }
    protected syncView(): void {
        const dialog = this.refs.dialog?.[0]
        if (!(dialog instanceof HTMLDialogElement)) return
        if (bool(this.open) && !dialog.open) {
            try { dialog.showModal(); const input = this.refs.input?.[0]; if (input instanceof HTMLElement) input.focus() }
            catch (error) { this.onError(error) }
        } else if (!bool(this.open) && dialog.open) dialog.close()
    }
}
export { CommandPaletteBase };
export type { CommandPaletteProps } from './CommandPaletteBase.js';
