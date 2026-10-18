import { Component, type CommonProps } from './Component.js'
import { bool, scalarText } from './value.js'
export type ControlSize = 'xs' | 'sm' | 'md' | 'lg'
export interface UIProps extends CommonProps {
    label?: string; accessibleLabel?: string; description?: string; disabled?: boolean; size?: ControlSize
}
/** Shared lifecycle and accessibility policy, without choosing any rendered element. */
export abstract class UIComponent<P extends UIProps = UIProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'label', 'accessible-label', 'description', 'disabled', 'size']
    label = ''; accessibleLabel = ''; description = ''; disabled = false; size: ControlSize = 'sm'
    private reflectingNativeState=false
    protected abstract syncView(): void
    protected get unavailable(): boolean { return bool(this.disabled) }
    protected displayLabel(): string { return scalarText(this.label) }
    protected accessibleName(): string { return scalarText(this.accessibleLabel) || scalarText(this.label) }
    protected syncCommon(): void {
        // For form-associated elements, even disabled="false" is natively disabled.
        // Normalize presence before consulting the browser's formDisabledCallback state.
        if(!this.reflectingNativeState){
            this.reflectingNativeState=true
            try{this.toggleAttribute('disabled',bool(this.disabled))}finally{this.reflectingNativeState=false}
        }
        this.dataset.size = ['xs','sm','md','lg'].includes(this.size) ? this.size : 'sm'
        this.toggleAttribute('data-disabled', this.unavailable)
        this.contentRoot.querySelectorAll<HTMLElement>('[data-cb-description]').forEach(n => { n.textContent = scalarText(this.description); n.hidden = !scalarText(this.description) })
    }
    protected mount(): void { this.syncCommon(); this.syncView() }
    protected update(_name: string): void { this.syncCommon(); this.syncView() }
    /** A cancelable semantic event; callers can veto before any state is changed. */
    protected request(name: string, detail: unknown): boolean {
        return this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }))
    }
    protected activeNode(): Element | null { return this.contentRoot instanceof ShadowRoot ? this.contentRoot.activeElement : this.ownerDocument.activeElement }
}
