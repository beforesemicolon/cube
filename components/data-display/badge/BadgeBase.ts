import { Component, type ComponentProps } from '../../core/Component.js'
import { scalarText } from '../../core/value.js'
import type { StudioKind, StudioValue } from '../../studio/types.js'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
export interface BadgeProps extends ComponentProps {
    value?: StudioValue
    tone?: BadgeTone
}

const badgeTones: ReadonlySet<string> = new Set([
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
])

/** Headless behavior for the Badge component. */
export abstract class BadgeBase extends Component<BadgeProps> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'value',
        'tone',
    ]
    value: StudioValue = ''
    tone: BadgeTone = 'neutral'
    readonly componentName = 'badge'
    readonly componentKind: StudioKind = 'display'
    get badgeTone(): BadgeTone {
        return badgeTones.has(this.tone) ? this.tone : 'neutral'
    }
    get badgeText(): string {
        return Array.isArray(this.value)
            ? this.value.join(', ')
            : scalarText(this.value) || scalarText(this.label)
    }
}
