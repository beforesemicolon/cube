import { Component, type ComponentProps } from '../../core/Component.js'

export type ActionBarProps = ComponentProps

/** Start/default slot composition for contextual action surfaces. */
export abstract class ActionBarBase<P extends ActionBarProps = ActionBarProps> extends Component<P> {
}
