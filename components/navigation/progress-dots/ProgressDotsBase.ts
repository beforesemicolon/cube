import { Component, type ComponentProps } from '../../core/Component.js'
import { finite } from '../../core/value.js'

export type ProgressDotsVariant = 'circles' | 'lines'

export interface ProgressDotsProps extends ComponentProps {
    variant?: ProgressDotsVariant
    totalSteps?: number
    activeIndex?: number
    lastReachableIndex?: number
    stepLabel?: string
    stepLabels?: readonly string[]
}

export interface ProgressDotsClickDetail {
    /** Zero-based index of the activated step. */
    index: number
    originalEvent: MouseEvent
}

/** A controlled step indicator. Consumers decide whether to change the active step. */
export abstract class ProgressDotsBase extends Component<ProgressDotsProps> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'variant',
        'total-steps',
        'active-index',
        'last-reachable-index',
        'step-label',
    ]

    variant: ProgressDotsVariant = 'circles'
    totalSteps = 0
    activeIndex = 0
    lastReachableIndex = -1
    stepLabel = 'Step {step}'
    stepLabels: readonly string[] = []

    protected get stepCount(): number {
        return Math.max(0, Math.trunc(finite(this.totalSteps, 0)))
    }

    protected get currentIndex(): number {
        return Math.min(this.stepCount - 1, Math.max(0, Math.trunc(finite(this.activeIndex, 0))))
    }

    protected get indices(): number[] {
        return Array.from({ length: this.stepCount }, (_, index) => index)
    }

    protected labelForStep(index: number): string {
        const label = this.stepLabels?.[index]
        if (typeof label === 'string' && label.trim()) return label.trim()
        const step = String(index + 1)
        const pattern = this.stepLabel || 'Step {step}'
        return pattern.includes('{step}') ? pattern.replaceAll('{step}', step) : `${pattern} ${step}`
    }

    protected isStepDisabled(index: number): boolean {
        const lastReachableIndex = Math.trunc(finite(this.lastReachableIndex, -1))
        return this.unavailable || (lastReachableIndex >= 0 && index > lastReachableIndex)
    }

    protected progressName = (): string => this.accessibleName() || 'Progress'
    protected progressVariant = (): ProgressDotsVariant =>
        this.variant === 'lines' ? 'lines' : 'circles'

    protected activateStep(index: number, event: Event): void {
        event.stopPropagation()
        if (!(event instanceof CustomEvent)) return
        const detail = (event as CustomEvent<{ originalEvent?: Event } | null>).detail
        const originalEvent = detail?.originalEvent
        if (!(originalEvent instanceof MouseEvent)) return
        originalEvent.stopPropagation()
        if (this.isStepDisabled(index)) return

        this.emit('click', { index, originalEvent } satisfies ProgressDotsClickDetail)
    }
}
