import { state } from '../core/runtime.js'

type SourceValueHost = HTMLElement & { readonly mounted: boolean }

/**
 * Keeps editor source strings intact instead of allowing the WebComponent
 * attribute bridge to JSON-parse them as component data.
 */
export class SourceValueController<T> {
    private readonly current: ReturnType<typeof state<T>>
    private explicitlySet = false
    private reflecting = false

    constructor(
        private readonly host: SourceValueHost,
        initialValue: T,
        private readonly fromAttribute: (value: string | null) => T,
        private readonly toAttribute: (value: T) => string | null,
        private readonly onChange: () => void,
    ) {
        this.current = state(initialValue)
        Object.defineProperty(this.host, 'value', {
            configurable: false,
            enumerable: true,
            get: (): T => this.current[0](),
            set: (value: T): void => { this.set(value) },
        })
    }

    get value(): T { return this.current[0]() }
    get isReflecting(): boolean { return this.reflecting }

    mount(): void {
        if (!this.explicitlySet && this.host.hasAttribute('value')) {
            this.current[1](this.fromAttribute(this.host.getAttribute('value')))
        }
    }

    readAttribute(): void {
        this.current[1](this.fromAttribute(this.host.getAttribute('value')))
    }

    set(value: T, notify = true): boolean {
        this.explicitlySet = true
        const changed = !Object.is(this.current[0](), value)
        this.current[1](value)
        this.reflect(value)
        if (changed && notify && this.host.mounted) this.onChange()
        return changed
    }

    private reflect(value: T): void {
        const attribute = this.toAttribute(value)
        this.reflecting = true
        try {
            if (attribute === null) {
                if (this.host.hasAttribute('value')) this.host.removeAttribute('value')
            } else if (this.host.getAttribute('value') !== attribute) {
                this.host.setAttribute('value', attribute)
            }
        } finally {
            this.reflecting = false
        }
    }
}
