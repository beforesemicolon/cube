import { Component, type CommonProps } from '../../core/Component.js'

export interface DividerProps extends CommonProps { orientation?: 'horizontal' | 'vertical'; decorative?: boolean }

/** Divider semantics independent of its visual renderer. */
export abstract class DividerBase<P extends DividerProps = DividerProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'orientation', 'decorative']
    orientation: DividerProps['orientation'] = 'horizontal'
    decorative = false

    protected syncDivider(): void {
        const orientation = this.orientation === 'vertical' ? 'vertical' : 'horizontal'
        this.dataset.orientation = orientation
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
