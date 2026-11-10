import { WebComponent } from './runtime.js'
import { bool, scalarText } from './value.js'

export type ControlSize = 'tiny' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export interface CommonProps {
    label?: string
    accessibleLabel?: string
    description?: string
    disabled?: boolean
    size?: ControlSize
}
export type ComponentProps = CommonProps

export abstract class Component<
    P extends CommonProps = CommonProps,
> extends WebComponent<P> {
    static observedAttributes = [
        'label',
        'accessible-label',
        'description',
        'disabled',
        'size',
    ]
    label = ''
    accessibleLabel = ''
    description = ''
    disabled = false
    size: ControlSize = 'sm'
    private disposers: Array<() => void> = []
    private reflectingNativeState = false
    protected syncView(): void {}
    protected mount(): void {
        this.syncView()
    }
    protected update(_name: string): void {
        this.syncView()
    }
    protected unmount(): void {}
    protected get unavailable(): boolean {
        return bool(this.disabled)
    }
    protected displayLabel = (): string => {
        return scalarText(this.label)
    }
    protected accessibleName = (): string => {
        return scalarText(this.accessibleLabel) || scalarText(this.label)
    }
    protected syncCommon(): void {
        if (!this.reflectingNativeState) {
            this.reflectingNativeState = true
            try {
                this.toggleAttribute('disabled', bool(this.disabled))
            } finally {
                this.reflectingNativeState = false
            }
        }
        this.dataset.size = ['tiny', 'xs', 'sm', 'md', 'lg', 'xl'].includes(
            this.size
        )
            ? this.size
            : 'sm'
        this.toggleAttribute('data-disabled', this.unavailable)
    }
    protected cleanup(fn: () => void): void {
        this.disposers.push(fn)
    }
    protected listen(
        target: EventTarget,
        name: string,
        listener: EventListener
    ): void {
        target.addEventListener(name, listener)
        this.cleanup(() => target.removeEventListener(name, listener))
    }
    onMount(): () => void {
        try {
            this.syncCommon()
            this.mount()
        } catch (error) {
            this.onError(error)
        }
        return () => {
            for (const fn of this.disposers.splice(0).reverse()) {
                try {
                    fn()
                } catch (e) {
                    this.onError(e)
                }
            }
            this.unmount()
        }
    }
    onUpdate(
        name: keyof P,
        _value: P[keyof P] | null,
        _old: P[keyof P] | null
    ): void {
        if (!this.mounted) return
        this.syncCommon()
        this.update(String(name))
    }
    emit(name: string, detail: unknown = {}): void {
        this.dispatchEvent(
            new CustomEvent(name, { detail, bubbles: true, composed: true })
        )
    }
    /** A cancelable semantic event; callers can veto before any state is changed. */
    protected request(name: string, detail: object): boolean {
        return this.dispatchEvent(
            new CustomEvent(name, {
                detail,
                bubbles: true,
                composed: true,
                cancelable: true,
            })
        )
    }
    /** Runs consumer-provided work through the component error boundary. */
    protected async runAction(
        action: () => void | Promise<void>
    ): Promise<boolean> {
        try {
            await action()
            return true
        } catch (error) {
            this.onError(error)
            return false
        }
    }
    protected activeNode(): Element | null {
        return this.contentRoot instanceof ShadowRoot
            ? this.contentRoot.activeElement
            : this.ownerDocument.activeElement
    }
    focus(options?: FocusOptions): void {
        const control = this.refs.control?.[0]
        if (control instanceof HTMLElement) control.focus(options)
        else super.focus(options)
    }
    onError(error: unknown): void {
        this.emit('error', {
            code: 'COMPONENT_ERROR',
            error,
            component: this.localName,
        })
    }
    protected documentLanguage(): string | undefined {
        return this.ownerDocument.documentElement.lang || undefined
    }
}
const brand = Symbol.for('@beforesemicolon/cube/component-version')
const componentVersion = '1.0.0'
export function register(tag: string, ctor: CustomElementConstructor): void {
    const existing = customElements.get(tag)
    if (!existing) {
        Object.defineProperty(ctor, brand, { value: componentVersion })
        customElements.define(tag, ctor)
    } else if (
        existing !== ctor &&
        Reflect.get(existing, brand) !== componentVersion
    ) {
        throw new Error(
            `The custom element ${tag} is already registered by a different implementation`
        )
    }
}
