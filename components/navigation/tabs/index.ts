import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { RovingFocus } from '../../core/roving.js'
import { scalarText } from '../../core/value.js'
import { actionLabel, createIconButton } from '../../action/create.js'
import { TabsBase } from './TabsBase.js'

export class Tabs extends TabsBase {
    private list?: HTMLElement
    private roving?: RovingFocus
    render(): Node {
        this.list = el('div', 'tablist')
        this.list.setAttribute('role', 'tablist')
        this.roving = new RovingFocus(
            () => Array.from(this.list?.querySelectorAll<HTMLButtonElement>('[role=tab]:not(:disabled)') ?? []),
            () => this.orientation ?? 'horizontal',
            index => { if (this.activation === 'automatic') this.list?.querySelectorAll<HTMLButtonElement>('[role=tab]:not(:disabled)')[index]?.click() },
        )
        this.list.addEventListener('keydown', event => this.roving?.keydown(event))
        return fragment(sheet(editorCSS + `:host{display:block}[part=tablist]{display:flex;align-items:flex-end;gap:var(--spacing-lg,16px);border-block-end:1px solid var(--color-separator,#dae0e4);overflow:auto}:host([data-orientation=vertical]) [part=tablist]{flex-direction:column;align-items:stretch;border-block-end:0;border-inline-end:1px solid var(--color-separator,#dae0e4)}[part=tab-item]{position:relative;display:flex;align-items:center;min-inline-size:0}[part=tab]{position:relative;min-block-size:32px;padding:4px 2px;border:0;border-radius:0;background:transparent;color:var(--color-muted-foreground,#606b73);overflow:hidden;text-overflow:ellipsis}[part=tab][aria-selected=true]{color:var(--color-foreground,#20262b)}[part=tab][aria-selected=true]::after{content:'';position:absolute;inset-inline:0;inset-block-end:-1px;block-size:2px;background:var(--color-primary,#2563eb)}[part=dirty]{inline-size:6px;block-size:6px;border-radius:50%;background:var(--color-warning);flex:none}[part=close]{margin-inline-start:2px}:host([data-orientation=vertical]) [part=tab-item]{inline-size:100%}:host([data-orientation=vertical]) [part=tab]{flex:1;text-align:start}:host([data-orientation=vertical]) [part=tab][aria-selected=true]::after{inset-inline-start:auto;inset-inline-end:-1px;inset-block:0;inline-size:2px;block-size:auto}`), this.list)
    }
    protected syncView(): void {
        if (!this.list) return
        const choices = this.choices
        const selected = choices.some(item => item.id === scalarText(this.value)) ? scalarText(this.value) : choices.find(item => !item.disabled)?.id ?? ''
        if (!scalarText(this.value) && selected) this.value = selected
        this.dataset.orientation = this.orientation === 'vertical' ? 'vertical' : 'horizontal'
        this.list.setAttribute('aria-orientation', this.dataset.orientation)
        this.list.setAttribute('aria-label', this.accessibleName())
        this.list.replaceChildren(...choices.map(item => {
            const source = this.items.find(candidate => scalarText(candidate.id) === item.id)
            const wrapper = el('div', 'tab-item')
            const tab = el('button', 'tab', item.label)
            tab.type = 'button'; tab.dataset.label = item.label; tab.disabled = this.unavailable || item.disabled
            tab.setAttribute('role', 'tab'); tab.setAttribute('aria-selected', String(item.id === selected))
            tab.id = `${this.id || 'cb-tabs'}-${item.id}-tab`; tab.setAttribute('aria-controls', `${this.id || 'cb-tabs'}-${item.id}-panel`)
            tab.addEventListener('click', event => this.choose(item, event))
            wrapper.append(tab)
            if (source?.dirty) { const dirty = el('span', 'dirty'); dirty.setAttribute('aria-hidden', 'true'); wrapper.append(dirty) }
            if (source?.closable) {
                const close = createIconButton('close', 'close', event => this.closeTab(source, event))
                actionLabel(close, scalarText(this.closeLabel).replaceAll('{tab}', item.label))
                close.size = 'xs'
                close.disabled = this.unavailable || item.disabled
                wrapper.append(close)
            }
            return wrapper
        }))
        const index = Math.max(0, choices.findIndex(item => item.id === selected && !item.disabled)); this.roving?.reset(index)
    }
}

register('cb-tabs', Tabs)
export { TabsBase }
export type { TabsProps, TabItem } from './TabsBase.js'
