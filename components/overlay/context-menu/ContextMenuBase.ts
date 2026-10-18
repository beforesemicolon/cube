import { MenuBase, type MenuProps } from '../../navigation/menu/MenuBase.js'
import { finite } from '../../core/value.js'

export interface ContextMenuProps extends MenuProps { open?: boolean; x?: number; y?: number }

/** Context-menu visibility and pointer anchoring layered on MenuBase. */
export abstract class ContextMenuBase<P extends ContextMenuProps = ContextMenuProps> extends MenuBase<P> {
    static observedAttributes = [...MenuBase.observedAttributes, 'open', 'x', 'y']
    open = false
    x = 0
    y = 0
    showAt(x: number, y: number): void {
        this.x = finite(x); this.y = finite(y); this.setOpen(true)
    }
    close(): void { this.setOpen(false) }
    protected setOpen(open: boolean): void {
        if (this.open === open) return
        this.open = open; this.toggleAttribute('open', open); this.syncView(); this.emit('cb-open-change', { open })
    }
}
