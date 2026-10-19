import { DropdownBase, type DropdownProps } from '../../overlay/dropdown/DropdownBase.js'
import { scalarText } from '../../core/value.js'

export type SplitButtonProps = DropdownProps

/** Primary-action behavior layered on the shared dropdown state machine. */
export abstract class SplitButtonBase<P extends SplitButtonProps = SplitButtonProps> extends DropdownBase<P> {
    protected activatePrimary(originalEvent: Event): void {
        if (this.unavailable || this.loading) return
        const detail = { value: scalarText(this.value), source: 'primary' as const, originalEvent }
        if (this.request('beforechange', detail)) this.emit('change', detail)
    }
}
