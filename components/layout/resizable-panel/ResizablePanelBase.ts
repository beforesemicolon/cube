import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { clamp, finite } from '../../core/value.js'

export interface ResizablePanelProps extends UIProps {
    value?: number
    min?: number
    max?: number
    step?: number
    placement?: 'start' | 'end'
    resizeLabel?: string
}

/** Pointer and keyboard resizing behavior without prescribing panel content. */
export abstract class ResizablePanelBase<P extends ResizablePanelProps = ResizablePanelProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'value', 'min', 'max', 'step', 'placement', 'resize-label']
    value = 320
    min = 180
    max = 640
    step = 16
    placement: 'start' | 'end' = 'end'
    resizeLabel = ''

    protected currentSize(): number { return clamp(finite(this.value, 320), finite(this.min, 180), finite(this.max, 640)) }
    protected resize(value: number, originalEvent?: Event): boolean {
        const next = clamp(value, finite(this.min, 180), finite(this.max, 640))
        if (this.unavailable || next === this.currentSize()) return false
        const detail = { value: next, originalEvent }
        if (!this.request('cb-before-resize', detail)) return false
        this.value = next
        this.syncView()
        this.emit('cb-resize', detail)
        return true
    }
}
