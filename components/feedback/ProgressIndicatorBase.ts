import { Component, type ComponentProps } from '../core/Component.js'

export interface ProgressIndicatorProps extends ComponentProps {
    progress?: number
    max?: number
    status?: string
}

/** Progress value and supporting copy shared by progress indicators. */
export abstract class ProgressIndicatorBase<P extends ProgressIndicatorProps = ProgressIndicatorProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'progress', 'max', 'status']
    progress = 0
    max = 100
    status = ''
}
