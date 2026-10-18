import { Component, type CommonProps } from '../../core/Component.js'
import { finite, text } from '../../core/value.js'

export type FlashbarType = 'info' | 'success' | 'warning' | 'danger' | 'error' | 'loading'
export type NormalizedFlashbarType = Exclude<FlashbarType, 'error'>
export type FlashbarPosition = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
export interface FlashbarActionContext { id: string; message: NormalizedFlashbarMessage; originalEvent: Event }
export type FlashbarActionHandler = (context: FlashbarActionContext) => void | Promise<void>

export interface FlashbarMessage {
    id?: string
    type?: FlashbarType
    title?: string
    heading?: string
    message?: string
    actionLabel?: string
    actionHref?: string
    actionTarget?: string
    action?: FlashbarActionHandler
    dismissOnAction?: boolean
    dismissLabel?: string
    dismissible?: boolean
    duration?: number
    autoDismissMs?: number
}

export interface NormalizedFlashbarMessage {
    id: string
    type: NormalizedFlashbarType
    heading: string
    message: string
    actionLabel: string
    actionHref: string
    actionTarget: string
    action?: FlashbarActionHandler
    dismissOnAction: boolean
    actionLoading: boolean
    dismissLabel: string
    dismissible: boolean
    duration: number
}

export interface FlashbarProps extends CommonProps {
    accessibleLabel?: string
    position?: FlashbarPosition
    maxVisible?: number
    messages?: FlashbarMessage[]
}

/** Queue, update and dismissal behavior independent of notification rendering. */
export abstract class FlashbarBase<P extends FlashbarProps = FlashbarProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'accessible-label', 'position', 'max-visible', 'messages']
    accessibleLabel = ''
    position: FlashbarPosition = 'top-end'
    maxVisible = 4
    messages: FlashbarMessage[] = []
    private sequence = 0
    private records: NormalizedFlashbarMessage[] = []
    private timers = new Map<string, { handle: number; deadline: number; remaining: number }>()

    protected abstract syncMessages(messages: readonly NormalizedFlashbarMessage[]): void

    protected mount(): void { this.replace(this.messages) }
    protected update(name: string): void {
        if (name === 'messages') this.replace(this.messages)
        else this.renderMessages()
    }

    protected unmount(): void {
        for (const timer of this.timers.values()) globalThis.clearTimeout(timer.handle)
        this.timers.clear()
    }

    show(message: FlashbarMessage): string {
        const record = this.normalizeMessage(message)
        const index = this.records.findIndex(item => item.id === record.id)
        if (index >= 0) this.records.splice(index, 1, record)
        else this.records.unshift(record)
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
        if (timer !== undefined) globalThis.clearTimeout(timer.handle)
        this.timers.delete(id)
        this.renderMessages()
        this.emit('cb-flashbar-dismiss', { id, reason, message })
        return true
    }

    clear(): void { for (const message of [...this.records]) this.dismiss(message.id, 'clear') }

    protected async action(message: NormalizedFlashbarMessage, originalEvent: Event): Promise<void> {
        this.emit('cb-flashbar-action', { id: message.id, message, originalEvent })
        if (message.actionLoading) return
        if (!message.action) {
            if (message.dismissOnAction) this.dismiss(message.id, 'action')
            return
        }
        const record = this.records.find(item => item.id === message.id)
        if (!record) return
        record.actionLoading = true
        this.pause(message.id)
        this.renderMessages()
        const completed = await this.runAction(() => message.action?.({ id: message.id, message, originalEvent }))
        const current = this.records.find(item => item.id === message.id)
        if (!current) return
        current.actionLoading = false
        if (completed && message.dismissOnAction) this.dismiss(message.id, 'action')
        else {
            this.resume(message.id)
            this.renderMessages()
        }
    }

    pause(id: string): void {
        const timer = this.timers.get(id)
        if (!timer) return
        globalThis.clearTimeout(timer.handle)
        timer.remaining = Math.max(0, timer.deadline - Date.now())
        timer.handle = 0
    }

    resume(id: string): void {
        const timer = this.timers.get(id)
        if (!timer || timer.handle) return
        if (timer.remaining <= 0) { this.dismiss(id, 'timeout'); return }
        timer.deadline = Date.now() + timer.remaining
        timer.handle = globalThis.setTimeout(() => this.dismiss(id, 'timeout'), timer.remaining)
    }

    private replace(messages: FlashbarMessage[]): void {
        for (const timer of this.timers.values()) globalThis.clearTimeout(timer.handle)
        this.timers.clear()
        this.records = Array.isArray(messages) ? messages.map(message => this.normalizeMessage(message)) : []
        for (const message of this.records) this.schedule(message)
        this.renderMessages()
    }

    private normalizeMessage(message: FlashbarMessage): NormalizedFlashbarMessage {
        const inputType = message.type ?? 'info'
        const type: NormalizedFlashbarType = inputType === 'error' ? 'danger' : ['info', 'success', 'warning', 'danger', 'loading'].includes(inputType) ? inputType : 'info'
        const duration = message.duration ?? message.autoDismissMs
        return {
            id: text(message.id).trim() || `cb-flash-${++this.sequence}`,
            type,
            heading: text(message.heading) || text(message.title),
            message: text(message.message),
            actionLabel: text(message.actionLabel),
            actionHref: text(message.actionHref),
            actionTarget: text(message.actionTarget),
            action: message.action,
            dismissOnAction: message.dismissOnAction ?? false,
            actionLoading: false,
            dismissLabel: text(message.dismissLabel),
            dismissible: message.dismissible ?? type !== 'loading',
            duration: Math.max(0, finite(duration, type === 'success' ? 5000 : 0)),
        }
    }

    private schedule(message: NormalizedFlashbarMessage): void {
        const previous = this.timers.get(message.id)
        if (previous !== undefined) globalThis.clearTimeout(previous.handle)
        if (!message.duration) { this.timers.delete(message.id); return }
        const deadline = Date.now() + message.duration
        const handle = globalThis.setTimeout(() => this.dismiss(message.id, 'timeout'), message.duration)
        this.timers.set(message.id, { handle, deadline, remaining: message.duration })
    }

    private renderMessages(): void {
        const maximum = Math.max(1, Math.trunc(finite(this.maxVisible, 4)))
        this.dataset.position = ['top-start', 'top-end', 'bottom-start', 'bottom-end'].includes(this.position) ? this.position : 'top-end'
        this.syncMessages(this.records.slice(0, maximum))
    }
}
