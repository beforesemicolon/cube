import { register } from '../../core/Component.js'
import { bool, finite } from '../../core/value.js'
import { ContextMenuBase } from './ContextMenuBase.js'
import { createMenuView, type MenuView } from '../../navigation/menu/view.js'

export class ContextMenu extends ContextMenuBase {
    private view?: MenuView
    render(): Node {
        this.view = createMenuView(this, (item, event) => { this.activate(item, event); this.close() })
        this.listen(this.ownerDocument, 'pointerdown', event => { if (this.open && !event.composedPath().includes(this)) this.close() })
        return this.view.root
    }
    protected syncView(): void {
        this.view?.update()
        this.hidden = !bool(this.open)
        this.style.position = 'fixed'; this.style.zIndex = 'var(--z-index-dropdown,40)'
        this.style.left = `${finite(this.x)}px`; this.style.top = `${finite(this.y)}px`
        if (bool(this.open)) this.view?.focusFirst()
    }
}

register('cb-context-menu', ContextMenu)
export { ContextMenuBase }
export type { ContextMenuProps } from './ContextMenuBase.js'
