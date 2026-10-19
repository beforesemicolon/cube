import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { ToolbarBase } from './ToolbarBase.js'

export class Toolbar extends ToolbarBase {
    stylesheet = editorCSS + `:host{display:inline-block;max-inline-size:100%}[part=toolbar]{display:flex;align-items:center;gap:var(--spacing-xs,4px);padding:var(--spacing-xs,4px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface,#fff);overflow:auto}`
    render(): Template { return html`<div part="toolbar" role="toolbar" aria-orientation="horizontal" aria-label="${() => this.accessibleName()}"><slot part="content"></slot></div>` }
}
export { ToolbarBase }
export type { ToolbarProps } from './ToolbarBase.js'
