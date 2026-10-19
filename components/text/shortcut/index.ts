import { html, repeat, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { scalarText } from '../../core/value.js'
import { ShortcutBase } from './ShortcutBase.js'

export class Shortcut extends ShortcutBase {
    stylesheet = editorCSS + `:host{display:inline-flex}[part=shortcut]{display:inline-flex;align-items:center;gap:2px}[part=key]{display:inline-grid;place-items:center;min-inline-size:18px;min-block-size:18px;padding:1px 4px;border:1px solid var(--color-separator,#dae0e4);border-block-end-width:2px;border-radius:4px;background:var(--color-surface-muted,#f5f6f5);font:500 10px/1 var(--typography-mono-font-family,ui-monospace,monospace);white-space:nowrap}`
    render(): Template {
        return html`<span part="shortcut" aria-label="${() => scalarText(this.props.accessibleLabel?.()) || this.keyList().join(' + ')}">
            ${repeat(this.keyList, key => html`<kbd part="key">${key}</kbd>`, { key: (_key, index) => index })}
        </span>`
    }
}
export { ShortcutBase }
export type { ShortcutProps } from './ShortcutBase.js'
