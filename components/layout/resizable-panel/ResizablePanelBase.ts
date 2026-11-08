import { Component, type ComponentProps } from '../../core/Component.js'
import { clamp, finite } from '../../core/value.js'

export type ResizablePanelValue = number | string

export interface ResizablePanelProps extends ComponentProps {
    value?: ResizablePanelValue
    defaultValue?: ResizablePanelValue
    min?: number
    max?: number
    maxRatio?: number
    step?: number
    placement?: 'start' | 'end'
    resizeLabel?: string
    collapseAt?: number
    variant?: 'panel' | 'plain'
}

/** Pointer and keyboard resizing behavior without prescribing panel content. */
export abstract class ResizablePanelBase<
    P extends ResizablePanelProps = ResizablePanelProps,
> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'value',
        'default-value',
        'min',
        'max',
        'max-ratio',
        'step',
        'placement',
        'resize-label',
        'collapse-at',
        'variant',
    ]
    value: ResizablePanelValue = 320
    defaultValue: ResizablePanelValue = 320
    min = 180
    max = 640
    maxRatio = 0
    step = 16
    placement: 'start' | 'end' = 'end'
    resizeLabel = ''
    collapseAt = 0
    variant: 'panel' | 'plain' = 'panel'

    protected maximumSize = (): number => {
        const configuredMaximum = finite(this.max, 640)
        const ratio = finite(this.maxRatio, 0)
        const availableSize =
            this.parentElement?.getBoundingClientRect().width ?? 0
        if (ratio <= 0 || availableSize <= 0) return configuredMaximum
        return Math.max(
            finite(this.min, 180),
            Math.min(configuredMaximum, availableSize * ratio)
        )
    }
    protected currentSize = (): number => {
        if (
            typeof this.value === 'number' ||
            /^\d+(?:\.\d+)?(?:px)?$/.test(this.value)
        )
            return clamp(
                finite(this.value, 320),
                finite(this.min, 180),
                this.maximumSize()
            )
        const rendered = this.getBoundingClientRect().width
        return clamp(rendered || 320, finite(this.min, 180), this.maximumSize())
    }
    protected cssSize = (): string => {
        if (typeof this.value === 'number') return `${this.currentSize()}px`
        const value = this.value.trim()
        if (/^\d+(?:\.\d+)?(?:px|%|rem|em|vw|vh)$/.test(value)) return value
        if (/^\d+(?:\.\d+)?$/.test(value)) return `${this.currentSize()}px`
        return '320px'
    }
    protected resize(value: number, originalEvent?: Event): boolean {
        const next = clamp(value, finite(this.min, 180), this.maximumSize())
        if (this.unavailable || next === this.currentSize()) return false
        const detail = { value: next, originalEvent }
        if (!this.request('beforeresize', detail)) return false
        this.value = next
        this.syncView()
        this.emit('resize', detail)
        return true
    }
    protected finishResize(originalEvent?: Event): void {
        this.emit('resizeend', {
            value: this.currentSize(),
            originalEvent,
        })
    }
    reset = (originalEvent?: Event): boolean => {
        const next = this.defaultValue
        const detail = {
            value: next,
            previousValue: this.value,
            originalEvent,
        }
        if (!this.request('beforereset', detail)) return false
        this.value = next
        this.syncView()
        this.emit('reset', detail)
        return true
    }
}
