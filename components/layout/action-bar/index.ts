import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { ActionBarBase } from './ActionBarBase.js'

export class ActionBar extends ActionBarBase {
    stylesheet = editorCSS + `:host{display:block}[part=bar]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-md,12px);min-block-size:var(--component-control-height-md,36px);padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface,#fff)}[part=start],[part=actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px);min-inline-size:0}[part=start]{flex:1}[part=actions]{flex:none}@container(max-width:420px){[part=bar]{align-items:stretch;flex-direction:column}[part=start],[part=actions]{inline-size:100%}[part=actions]{overflow:auto}}`
    render(): Template { return html`<div part="bar" role="toolbar" aria-label="${() => this.accessibleName()}"><div part="start"><slot name="start" part="start-content"></slot></div><div part="actions"><slot part="content"></slot></div></div>` }
}
export { ActionBarBase }
export type { ActionBarProps } from './ActionBarBase.js'
