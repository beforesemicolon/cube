import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { ActionBarBase } from './ActionBarBase.js'

export class ActionBar extends ActionBarBase {
    private bar?: HTMLElement
    render(): Node {
        this.bar = el('div', 'bar')
        this.bar.setAttribute('role', 'toolbar')
        const start = el('div', 'start')
        start.append(slot('start', '', 'start-content'))
        const actions = el('div', 'actions')
        actions.append(slot('', '', 'content'))
        this.bar.append(start, actions)
        return fragment(sheet(editorCSS + `:host{display:block}[part=bar]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-md,12px);min-block-size:var(--component-control-height-md,36px);padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface,#fff)}[part=start],[part=actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px);min-inline-size:0}[part=start]{flex:1}[part=actions]{flex:none}@container(max-width:420px){[part=bar]{align-items:stretch;flex-direction:column}[part=start],[part=actions]{inline-size:100%}[part=actions]{overflow:auto}}`), this.bar)
    }
    protected syncView(): void {
        if (!this.bar) return
        this.bar.setAttribute('aria-label', this.accessibleName())
    }
}

register('cb-action-bar', ActionBar)
export { ActionBarBase }
export type { ActionBarProps } from './ActionBarBase.js'
