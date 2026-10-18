type SourceValueHost = HTMLElement & { readonly mounted: boolean }

/**
 * Keeps editor source strings intact instead of allowing the WebComponent
 * attribute bridge to JSON-parse them as component data.
 */
export class SourceValueController<T> {
    private current: T
    private explicitlySet = false
    private reflecting = false

    constructor(
        private readonly host: SourceValueHost,
        initialValue: T,
        private readonly fromAttribute: (value: string | null) => T,
        private readonly toAttribute: (value: T) => string | null,
        private readonly onChange: () => void,
    ) {
        this.current = initialValue
        Object.defineProperty(this.host, 'value', {
            configurable: false,
            enumerable: true,
            get: (): T => this.current,
            set: (value: T): void => { this.set(value) },
        })
    }

    get value(): T { return this.current }
    get isReflecting(): boolean { return this.reflecting }

    mount(): void {
        if (!this.explicitlySet && this.host.hasAttribute('value')) {
            this.current = this.fromAttribute(this.host.getAttribute('value'))
        }
    }

    readAttribute(): void {
        this.current = this.fromAttribute(this.host.getAttribute('value'))
    }

    set(value: T, notify = true): boolean {
        this.explicitlySet = true
        const changed = !Object.is(this.current, value)
        this.current = value
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
