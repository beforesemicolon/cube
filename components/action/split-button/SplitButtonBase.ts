import { DropdownBase, type DropdownProps } from '../../overlay/dropdown/DropdownBase.js'
import { scalarText } from '../../core/value.js'

export interface SplitButtonProps extends DropdownProps { actionValue?: string; menuLabel?: string; loading?: boolean }

/** Primary-action behavior layered on the shared dropdown state machine. */
export abstract class SplitButtonBase<P extends SplitButtonProps = SplitButtonProps> extends DropdownBase<P> {
    static observedAttributes = [...DropdownBase.observedAttributes, 'action-value', 'menu-label', 'loading']
    actionValue = ''
    menuLabel = ''
    loading = false
    protected activatePrimary(originalEvent: Event): void {
        if (this.unavailable || this.loading) return
        const detail = { value: scalarText(this.actionValue), source: 'primary' as const, originalEvent }
        if (this.request('cb-before-action', detail)) this.emit('cb-action', detail)
    }
}
