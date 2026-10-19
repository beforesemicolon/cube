import { Component, type ComponentProps } from '../../core/Component.js'

export type ToolbarProps = ComponentProps

/** Toolbar semantics independent of the actions slotted into it. */
export abstract class ToolbarBase<P extends ToolbarProps = ToolbarProps> extends Component<P> {
}
