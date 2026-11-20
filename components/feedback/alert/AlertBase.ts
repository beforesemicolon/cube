import { MessageBase, type MessageProps } from '../MessageBase.js'
import type { StudioKind } from '../../studio/types.js'
import { bool } from '../../core/value.js'

export interface AlertProps extends MessageProps {
    dismissible?: boolean
    dismissLabel?: string
}

/** Headless behavior for the Alert component. */
export abstract class AlertBase extends MessageBase<AlertProps> {
    static observedAttributes = [
        ...MessageBase.observedAttributes,
        'dismissible',
        'dismiss-label',
    ]

    readonly componentName = 'alert'
    readonly componentKind: StudioKind = 'status'
    dismissible = false
    dismissLabel = ''

    dismiss(originalEvent?: Event): boolean {
        if (!bool(this.dismissible) || this.unavailable || this.hidden)
            return false
        const detail = { originalEvent }
        if (!this.request('beforedismiss', detail)) return false
        this.hidden = true
        this.emit('dismiss', detail)
        return true
    }
}
