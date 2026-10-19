import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { bool, scalarText } from '../../core/value.js'
import type { NormalizedItem } from '../../core/items.js'
import { CommandPaletteBase } from './CommandPaletteBase.js'
const css = editorCSS + `:host{display:contents}[part=dialog]{inline-size:min(560px,calc(100vw - 24px));max-block-size:min(70dvh,640px);padding:var(--spacing-sm,8px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-md,10px);background:var(--color-surface-raised,#fff);color:var(--color-foreground,#20262b);box-shadow:0 24px 70px rgba(12,18,24,.24)}[part=dialog]::backdrop{background:var(--component-overlay-backdrop,rgba(10,16,22,.56))}[part=search]{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:var(--spacing-sm,8px);padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border:1px solid var(--color-border,#8a959f);border-radius:var(--radius-sm,6px)}[part=input]{display:block;inline-size:100%;min-inline-size:0;--component-studio-control-width:100%;--component-studio-control-min-width:0}[part=input]::part(control){min-block-size:28px;padding:0;border:0;background:transparent;outline:0}[part=results]{margin-block-start:var(--spacing-sm,8px)}[part=empty]{padding:var(--spacing-lg,16px);text-align:center}`;
export class CommandPalette extends CommandPaletteBase {
    render(): Template {
        return html`<style part="styles">${css}</style>
            <dialog ref="dialog" part="dialog" oncancel="${(event: Event) => { event.preventDefault(); event.stopPropagation(); this.close() }}">
                <label part="search"><cb-icon part="icon" name="search" decorative="true"></cb-icon>
                    <cb-text-input ref="input" part="input" exportparts="control:input-control"
                        placeholder="${() => scalarText(this.placeholder)}" accessible-label="${() => this.accessibleName()}" value="${() => scalarText(this.query)}"
                        onchange="${(event: CustomEvent<{ value: string }>) => { event.stopPropagation(); this.query = scalarText(event.detail.value) }}"></cb-text-input>
                </label>
                <cb-menu part="results" items="${() => this.results}" accessible-label="${() => this.accessibleName()}"
                    onaction="${(event: CustomEvent<{ item: NormalizedItem }>) => { event.stopPropagation(); if (event.detail.item) this.select(event.detail.item, event) }}"></cb-menu>
                <p part="empty" hidden="${() => this.results.length > 0 || !scalarText(this.emptyLabel)}">${() => scalarText(this.emptyLabel)}</p>
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
