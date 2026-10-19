import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { scalarText } from '../../core/value.js'
import { ToolbarBase } from './ToolbarBase.js'

export class Toolbar extends ToolbarBase {
    private toolbar?: HTMLElement
    render(): Node {
        this.toolbar = el('div', 'toolbar')
        this.toolbar.setAttribute('role', 'toolbar')
        this.toolbar.append(slot('', '', 'content'))
        return fragment(sheet(editorCSS + `:host{display:inline-block;max-inline-size:100%}[part=toolbar]{display:flex;align-items:center;gap:var(--spacing-xs,4px);padding:var(--spacing-xs,4px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface,#fff);overflow:auto}`), this.toolbar)
    }
    protected syncView(): void {
        if (!this.toolbar) return
        this.toolbar.setAttribute('aria-orientation', 'horizontal')
        this.toolbar.setAttribute('aria-label', scalarText(this.accessibleLabel) || scalarText(this.label))
    }
}

register('cb-toolbar', Toolbar)
export { ToolbarBase }
export type { ToolbarProps } from './ToolbarBase.js'
