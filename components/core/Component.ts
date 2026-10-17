import { WebComponent } from '@beforesemicolon/web-component'
import { messages, type Messages } from '../locales/index.js'
import { text } from './value.js'
export interface CommonProps { locale?: string; labels?: Partial<Messages> }
export abstract class Component<P extends CommonProps = CommonProps> extends WebComponent<P> {
    static observedAttributes = ['locale', 'labels']
    locale = 'en'
    labels: Partial<Messages> = {}
    private disposers: Array<() => void> = []
    protected get copy(): Messages { return messages(this.locale, this.labels) }
    protected mount(): void {}
    protected update(_name: string): void {}
    protected unmount(): void {}
    protected cleanup(fn: () => void): void { this.disposers.push(fn) }
    protected listen(target: EventTarget, name: string, listener: EventListener): void {
        target.addEventListener(name, listener)
        this.cleanup(() => target.removeEventListener(name, listener))
    }
    onMount(): () => void {
        try { this.mount() } catch (error) { this.onError(error) }
        return () => {
            for (const fn of this.disposers.splice(0).reverse()) { try { fn() } catch (e) { this.onError(e) } }
            this.unmount()
        }
    }
    onUpdate(name: keyof P, _value: P[keyof P] | null, _old: P[keyof P] | null): void { if (this.mounted) this.update(String(name)) }
    emit(name: string, detail: unknown = {}): void {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }))
    }
    onError(error: unknown): void { this.emit('cb-error', { code: 'COMPONENT_ERROR', error, component: this.localName }) }
    protected language(): string { return text(this.locale, 'en') || 'en' }
}
const brand = Symbol.for('@beforesemicolon/cube/component-version')
export function register(tag: string, ctor: CustomElementConstructor): void {
    const existing = customElements.get(tag)
    if (!existing) {
        Object.defineProperty(ctor, brand, { value: '0.3.0-alpha.0' })
        customElements.define(tag, ctor)
    } else if (existing !== ctor && Reflect.get(existing, brand) !== '0.3.0-alpha.0') {
        throw new Error(`The custom element ${tag} is already registered by a different implementation`)
    }
}
