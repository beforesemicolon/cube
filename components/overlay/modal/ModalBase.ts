import { Component, type CommonProps } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'
import { editorMessage, type EditorMessages } from '../../core/editor-locales.js'

export type ModalSize = 'sm' | 'md' | 'lg' | 'full'
export type ModalCloseReason = 'close-button' | 'escape' | 'backdrop' | 'programmatic' | 'confirmed' | 'cancelled'

export interface ModalProps extends CommonProps {
    open?: boolean
    heading?: string
    description?: string
    closeLabel?: string
    dismissible?: boolean
    closeOnBackdrop?: boolean
    modalSize?: ModalSize
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
    ]

    open = false
    heading = ''
    description = ''
    closeLabel = ''
    dismissible = true
    closeOnBackdrop = true
    modalSize: ModalSize = 'md'
    private reflectingOpen = false

    protected abstract dialogElement(): HTMLDialogElement | undefined
    protected abstract syncDialog(): void

    protected ui(key: keyof EditorMessages): string {
        return editorMessage(this.locale, this.labels, key)
    }

    protected mount(): void { this.syncOpenState(); this.syncDialog() }
    protected update(): void { this.syncOpenState(); this.syncDialog() }

    show(): boolean {
        if (this.open) return true
        if (!this.dispatchEvent(new CustomEvent('cb-before-open', { bubbles: true, composed: true, cancelable: true }))) return false
        this.setOpen(true)
        this.emit('cb-open', {})
        return true
    }

    close(reason: ModalCloseReason = 'programmatic'): boolean {
        if (!this.open && !this.dialogElement()?.open) return true
        const detail = { reason }
        if (!this.dispatchEvent(new CustomEvent('cb-before-close', { detail, bubbles: true, composed: true, cancelable: true }))) return false
        this.setOpen(false)
        this.emit('cb-close', detail)
        return true
    }

    protected handleCancel(event: Event): void {
        event.preventDefault()
        if (!bool(this.dismissible)) return
        this.emit('cb-cancel', { reason: 'escape' })
        this.close('escape')
    }

    protected handleBackdrop(event: MouseEvent): void {
        if (event.target === this.dialogElement() && bool(this.dismissible) && bool(this.closeOnBackdrop)) this.close('backdrop')
    }

    protected closeText(): string { return scalarText(this.closeLabel) || this.ui('close') }

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
            try { dialog.showModal() } catch (error) { this.onError(error) }
        } else if (!shouldOpen && dialog.open) dialog.close()
    }
}
