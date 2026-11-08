import { Component, type ComponentProps } from '../../core/Component.js'
import type { StudioKind } from '../../studio/types.js'

export interface SpinnerProps extends ComponentProps {
    status?: string
}

/** Headless behavior for the Spinner component. */
export abstract class SpinnerBase extends Component<SpinnerProps> {
    static observedAttributes = [...Component.observedAttributes, 'status']
    status = ''
    readonly componentName = 'spinner'
    readonly componentKind: StudioKind = 'progress'
}
