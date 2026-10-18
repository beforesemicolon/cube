import { Component, type CommonProps } from '../../core/Component.js'
import { finite, text } from '../../core/value.js'

export type FlashbarType = 'info' | 'success' | 'warning' | 'danger' | 'loading'
export type FlashbarPosition = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

export interface FlashbarMessage {
    id?: string
    type?: FlashbarType
    heading?: string
    message: string
    actionLabel?: string
    dismissLabel?: string
    dismissible?: boolean
    duration?: number
}

export interface NormalizedFlashbarMessage {
    id: string
    type: FlashbarType
    heading: string
    message: string
    actionLabel: string
    dismissLabel: string
    dismissible: boolean
    duration: number
}

export interface FlashbarProps extends CommonProps {
    position?: FlashbarPosition
    maxVisible?: number
    messages?: FlashbarMessage[]
}

/** Queue, update and dismissal behavior independent of notification rendering. */
export abstract class FlashbarBase<P extends FlashbarProps = FlashbarProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'position', 'max-visible', 'messages']
    position: FlashbarPosition = 'top-end'
    maxVisible = 4
    messages: FlashbarMessage[] = []
    private sequence = 0
    private records: NormalizedFlashbarMessage[] = []
    private timers = new Map<string, number>()

    protected abstract syncMessages(messages: readonly NormalizedFlashbarMessage[]): void

    protected mount(): void { this.replace(this.messages) }
    protected update(name: string): void {
        if (name === 'messages') this.replace(this.messages)
        else this.renderMessages()
    }

    protected unmount(): void {
        for (const timer of this.timers.values()) globalThis.clearTimeout(timer)
        this.timers.clear()
    }

    show(message: FlashbarMessage): string {
        const record = this.normalizeMessage(message)
        const index = this.records.findIndex(item => item.id === record.id)
        if (index >= 0) this.records.splice(index, 1, record)
        else this.records.push(record)
        this.schedule(record)
        this.renderMessages()
        this.emit('cb-flashbar-show', { message: record })
        return record.id
    }

    updateMessage(id: string, message: Partial<FlashbarMessage>): boolean {
        const current = this.records.find(item => item.id === id)
        if (!current) return false
        this.show({ ...current, ...message, id })
        return true
    }

    dismiss(id: string, reason = 'programmatic'): boolean {
        const index = this.records.findIndex(item => item.id === id)
        if (index < 0) return false
        const [message] = this.records.splice(index, 1)
        const timer = this.timers.get(id)
        if (timer !== undefined) globalThis.clearTimeout(timer)
        this.timers.delete(id)
        this.renderMessages()
        this.emit('cb-flashbar-dismiss', { id, reason, message })
        return true
    }

    clear(): void { for (const message of [...this.records]) this.dismiss(message.id, 'clear') }

    protected action(message: NormalizedFlashbarMessage, originalEvent: Event): void {
        this.emit('cb-flashbar-action', { id: message.id, message, originalEvent })
    }

    private replace(messages: FlashbarMessage[]): void {
        for (const timer of this.timers.values()) globalThis.clearTimeout(timer)
        this.timers.clear()
        this.records = Array.isArray(messages) ? messages.map(message => this.normalizeMessage(message)) : []
        for (const message of this.records) this.schedule(message)
        this.renderMessages()
    }

    private normalizeMessage(message: FlashbarMessage): NormalizedFlashbarMessage {
        const type: FlashbarType = ['info', 'success', 'warning', 'danger', 'loading'].includes(message.type ?? '') ? message.type ?? 'info' : 'info'
        return {
            id: text(message.id).trim() || `cb-flash-${++this.sequence}`,
            type,
            heading: text(message.heading),
            message: text(message.message),
            actionLabel: text(message.actionLabel),
            dismissLabel: text(message.dismissLabel),
            dismissible: message.dismissible ?? type !== 'loading',
            duration: Math.max(0, finite(message.duration, type === 'loading' ? 0 : 5000)),
        }
    }

    private schedule(message: NormalizedFlashbarMessage): void {
        const previous = this.timers.get(message.id)
        if (previous !== undefined) globalThis.clearTimeout(previous)
        if (!message.duration) { this.timers.delete(message.id); return }
        this.timers.set(message.id, globalThis.setTimeout(() => this.dismiss(message.id, 'timeout'), message.duration))
    }

    private renderMessages(): void {
        const maximum = Math.max(1, Math.trunc(finite(this.maxVisible, 4)))
        this.dataset.position = ['top-start', 'top-end', 'bottom-start', 'bottom-end'].includes(this.position) ? this.position : 'top-end'
        this.syncMessages(this.records.slice(-maximum))
    }
}
