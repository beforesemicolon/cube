import { Component, type CommonProps } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'

export type ModalSize = 'sm' | 'md' | 'lg' | 'full' | 'page'
export type ModalLayer = 'top' | 'document'
export type ModalCloseReason = 'close-button' | 'escape' | 'backdrop' | 'programmatic' | 'confirmed' | 'cancelled' | 'action' | 'replaced' | 'invalidated'

export interface ModalProps extends CommonProps {
    open?: boolean
    heading?: string
    description?: string
    closeLabel?: string
    cancelLabel?: string
    showCancel?: boolean
    dismissible?: boolean
    closeOnBackdrop?: boolean
    modalSize?: ModalSize
    layer?: ModalLayer
    returnFocus?: boolean
}

/** Native-dialog state and lifecycle without prescribing the dialog rendering. */
export abstract class ModalBase<P extends ModalProps = ModalProps> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'open',
        'heading',
        'description',
        'close-label',
        'dismissible',
        'close-on-backdrop',
        'modal-size',
        'layer',
        'return-focus',
    ]

    open = false
    heading = ''
    description = ''
    closeLabel = ''
    cancelLabel = ''
    showCancel = true
    dismissible = true
    closeOnBackdrop = true
    modalSize: ModalSize = 'md'
    layer: ModalLayer = 'top'
    returnFocus = true
    private reflectingOpen = false
    private returnTarget?: HTMLElement

    protected abstract dialogElement(): HTMLDialogElement | undefined
    protected abstract syncDialog(): void

    protected mount(): void { this.syncOpenState(); this.syncDialog() }
    protected update(): void { this.syncOpenState(); this.syncDialog() }

    show(): boolean {
        if (this.open) return true
        if (!this.dispatchEvent(new CustomEvent('cb-before-open', { bubbles: true, composed: true, cancelable: true }))) return false
        this.captureReturnTarget()
        this.setOpen(true)
        if (!this.dialogElement()?.open) {
            this.setOpen(false)
            return false
        }
        this.emit('cb-open', {})
        return true
    }

    close(reason: ModalCloseReason = 'programmatic'): boolean {
        if (!this.open && !this.dialogElement()?.open) return true
        const detail = { reason }
        if (!this.dispatchEvent(new CustomEvent('cb-before-close', { detail, bubbles: true, composed: true, cancelable: true }))) return false
        this.setOpen(false)
        this.emit('cb-close', detail)
        this.restoreFocus()
        return true
    }

    protected handleCancel(event: Event): void {
        event.preventDefault()
        this.dismiss('escape', event)
    }

    protected handleBackdrop(event: MouseEvent): void {
        if (event.target === this.dialogElement() && bool(this.closeOnBackdrop)) this.dismiss('backdrop', event)
    }

    protected closeText(): string { return scalarText(this.closeLabel) }
    protected cancelText(): string { return scalarText(this.cancelLabel) }

    protected cancel(event: Event): void {
        this.dismiss('cancelled', event)
    }

    protected dismiss(reason: ModalCloseReason, originalEvent?: Event): void {
        if (!bool(this.dismissible)) return
        this.emit('cb-cancel', { reason, originalEvent })
        this.close(reason)
    }

    private setOpen(value: boolean): void {
        this.reflectingOpen = true
        try {
            this.open = value
            this.toggleAttribute('open', value)
        } finally { this.reflectingOpen = false }
        this.syncOpenState()
        this.syncDialog()
    }

    private syncOpenState(): void {
        if (this.reflectingOpen) return
        const dialog = this.dialogElement()
        if (!dialog) return
        const shouldOpen = bool(this.open)
        if (shouldOpen && !dialog.open) {
            this.captureReturnTarget()
            try {
                if (this.layer === 'document') dialog.show()
                else dialog.showModal()
            } catch (error) { this.onError(error) }
        } else if (!shouldOpen && dialog.open) dialog.close()
    }

    private captureReturnTarget(): void {
        if (this.returnTarget?.isConnected) return
        let active: Element | null = this.ownerDocument.activeElement
        while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
        if (active instanceof HTMLElement && active !== this) this.returnTarget = active
    }

    private restoreFocus(): void {
        const target = this.returnTarget
        this.returnTarget = undefined
        if (!bool(this.returnFocus) || !target?.isConnected) return
        queueMicrotask(() => target.focus({ preventScroll: true }))
    }
}
