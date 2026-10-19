import { bool, scalarText } from '../../core/value.js'
import { ModalBase, type ModalProps } from '../modal/ModalBase.js'

export interface AlertDialogProps extends ModalProps {
    confirmLabel?: string
    destructive?: boolean
    busy?: boolean
}

/** Confirmation semantics layered on the common modal lifecycle. */
export abstract class AlertDialogBase<P extends AlertDialogProps = AlertDialogProps> extends ModalBase<P> {
    static observedAttributes = [...ModalBase.observedAttributes, 'confirm-label', 'cancel-label', 'show-cancel', 'destructive', 'busy']
    confirmLabel = ''
    destructive = false
    busy = false

    protected confirmText(): string { return scalarText(this.confirmLabel) }

    protected confirm(event: Event): void {
        if (bool(this.busy)) return
        const detail = { originalEvent: event }
        if (!this.dispatchEvent(new CustomEvent('beforeconfirm', { detail, bubbles: true, composed: true, cancelable: true }))) return
        this.emit('confirm', detail)
        this.close('confirmed')
    }

    protected cancel(event: Event): void {
        if (bool(this.busy)) return
        super.cancel(event)
    }
}
