import { Component, type ComponentProps } from '../../core/Component.js'
import { bool } from '../../core/value.js'

export interface ActionBarProps extends ComponentProps {
    wrap?: boolean
    actionsOnly?: boolean
}

/** Start/default slot composition for contextual action surfaces. */
export abstract class ActionBarBase<
    P extends ActionBarProps = ActionBarProps,
> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'wrap',
        'actions-only',
    ]
    wrap = false
    actionsOnly = false
    protected syncView(): void {
        this.toggleAttribute('data-wrap', bool(this.wrap))
        this.toggleAttribute('data-actions-only', bool(this.actionsOnly))
    }
}
