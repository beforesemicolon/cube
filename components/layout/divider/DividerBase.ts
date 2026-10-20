import { Component, type CommonProps } from '../../core/Component.js'
import { bool } from '../../core/value.js'

export interface DividerProps extends CommonProps { stacked?: boolean; decorative?: boolean }

/** Divider semantics independent of its visual renderer. */
export abstract class DividerBase<P extends DividerProps = DividerProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'stacked', 'decorative']
    stacked = false
    decorative = false

    protected syncDivider(): void {
        const orientation = bool(this.stacked) ? 'vertical' : 'horizontal'
        this.toggleAttribute('data-stacked', bool(this.stacked))
        if (this.decorative) {
            this.setAttribute('role', 'presentation')
            this.removeAttribute('aria-orientation')
        } else {
            this.setAttribute('role', 'separator')
            this.setAttribute('aria-orientation', orientation)
        }
    }

    protected mount(): void { this.syncDivider() }
    protected update(): void { this.syncDivider() }
}
