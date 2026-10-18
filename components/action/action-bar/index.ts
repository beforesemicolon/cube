import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { bool } from '../../core/value.js'
import { ActionBarBase } from './ActionBarBase.js'

export class ActionBar extends ActionBarBase {
    private bar?: HTMLElement
    private statusNode?: HTMLElement
    render(): Node {
        this.bar = el('div', 'bar')
        this.bar.setAttribute('role', 'toolbar')
        this.statusNode = el('span', 'status')
        const actions = el('div', 'actions')
        actions.append(slot('', '', 'content'))
        this.bar.append(this.statusNode, actions)
        return fragment(sheet(editorCSS + `:host{display:block}[part=bar]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-md,12px);min-block-size:var(--component-control-height-md,36px);padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface,#fff)}[part=status]{min-inline-size:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}[part=actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px)}@container(max-width:420px){[part=bar]{align-items:flex-start;flex-direction:column}[part=actions]{inline-size:100%;overflow:auto}}`), this.bar)
    }
    protected syncView(): void {
        if (!this.bar || !this.statusNode) return
        this.statusNode.textContent = this.statusText()
        this.statusNode.hidden = !this.statusText()
        this.bar.setAttribute('aria-label', this.accessibleName())
        this.bar.setAttribute('aria-busy', String(bool(this.busy)))
    }
}

register('cb-action-bar', ActionBar)
export { ActionBarBase }
export type { ActionBarProps } from './ActionBarBase.js'
