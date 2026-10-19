import { Component, type ComponentProps } from '../../core/Component.js'
import { finite, scalarText } from '../../core/value.js'

export interface ActionBarProps extends ComponentProps { selectionCount?: number; busy?: boolean; status?: string }

/** Selection/status behavior for contextual action surfaces. */
export abstract class ActionBarBase<P extends ActionBarProps = ActionBarProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'selection-count', 'busy', 'status']
    selectionCount = 0
    busy = false
    status = ''
    protected statusText(): string {
        return scalarText(this.status)
    }
}
