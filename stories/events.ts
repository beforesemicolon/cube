import { action } from 'storybook/actions'
import { cubeEventNames, type CubeEventName } from './event-names.js'

type CubeEventDetail = string | number | boolean | null | object | undefined

interface CubeEventRecord {
    readonly component: string
    readonly detail: CubeEventDetail
    readonly bubbles: boolean
    readonly composed: boolean
    readonly cancelable: boolean
    readonly defaultPrevented: boolean
}

type CubeEventLogger = (record: CubeEventRecord) => void

const loggers = new Map<CubeEventName, CubeEventLogger>()

function loggerFor(name: CubeEventName): CubeEventLogger {
    const existing = loggers.get(name)
    if (existing) return existing
    const storybookAction = action(name)
    const logger: CubeEventLogger = record => { storybookAction(record) }
    loggers.set(name, logger)
    return logger
}

function isCubeCustomEvent(event: Event): event is CustomEvent<CubeEventDetail> {
    return event instanceof CustomEvent
}

class CubeStoryEvents extends HTMLElement {
    private readonly listeners = new Map<CubeEventName, EventListener>()

    constructor() {
        super()
        this.style.display = 'contents'
    }

    connectedCallback(): void {
        if (this.listeners.size > 0) return
        for (const name of cubeEventNames) {
            // `cb-before-*` events are cancellable lifecycle hooks, not a second
            // user outcome. Logging both makes one interaction look duplicated.
            if (name.startsWith('cb-before-')) continue
            const listener: EventListener = event => {
                loggerFor(name)({
                    component: event.target instanceof Element ? event.target.localName : '',
                    detail: isCubeCustomEvent(event) ? event.detail : undefined,
                    bubbles: event.bubbles,
                    composed: event.composed,
                    cancelable: event.cancelable,
                    defaultPrevented: event.defaultPrevented,
                })
            }
            this.listeners.set(name, listener)
            this.addEventListener(name, listener)
        }
    }

    disconnectedCallback(): void {
        for (const [name, listener] of this.listeners) this.removeEventListener(name, listener)
        this.listeners.clear()
    }
}

export function registerCubeStoryEvents(): void {
    if (!customElements.get('cube-story-events')) customElements.define('cube-story-events', CubeStoryEvents)
}
