import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { html, repeat, type Template } from '../../core/runtime.js'
import { ListBase } from './ListBase.js'

export class List<T = string, K = number> extends ListBase<T, K> {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<div ref="items" part="items" role="list" aria-label="${this.accessibleName}" data-orientation="${this.direction}" style="--cb-list-gap:${this.itemGap}">
            ${repeat(this.visibleEntries, entry => html`<div part="item" role="listitem">${() => this.renderedItem(entry)}</div>`, { key: entry => entry.key })}
            <slot></slot>
        </div>`
    }
}

export { ListBase }
export type { ListProps, ListItems, ListRenderer, ListOrientation, ListLoadMoreDetail } from './ListBase.js'

register('cb-list', List)
