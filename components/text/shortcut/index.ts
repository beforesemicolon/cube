import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { scalarText } from '../../core/value.js'
import { ShortcutBase } from './ShortcutBase.js'

export class Shortcut extends ShortcutBase {
    private keysNode?: HTMLElement
    render(): Node {
        this.keysNode = el('span', 'shortcut')
        return fragment(sheet(editorCSS + `:host{display:inline-flex}[part=shortcut]{display:inline-flex;align-items:center;gap:2px}[part=key]{display:inline-grid;place-items:center;min-inline-size:18px;min-block-size:18px;padding:1px 4px;border:1px solid var(--color-separator,#dae0e4);border-block-end-width:2px;border-radius:4px;background:var(--color-surface-muted,#f5f6f5);font:500 10px/1 var(--typography-mono-font-family,ui-monospace,monospace);white-space:nowrap}`), this.keysNode)
    }
    protected mount(): void { this.syncShortcut() }
    protected update(): void { this.syncShortcut() }
    private syncShortcut(): void {
        if (!this.keysNode) return
        this.keysNode.replaceChildren(...this.keyList().map(key => el('kbd', 'key', key)))
        this.keysNode.setAttribute('aria-label', scalarText(this.accessibleLabel) || this.keyList().join(' + '))
    }
}

register('cb-shortcut', Shortcut)
export { ShortcutBase }
export type { ShortcutProps } from './ShortcutBase.js'
