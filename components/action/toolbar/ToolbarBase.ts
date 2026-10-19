import { Component, type ComponentProps } from '../../core/Component.js'

export interface ToolbarProps extends ComponentProps { orientation?: 'horizontal' | 'vertical' }

/** Toolbar semantics independent of the actions slotted into it. */
export abstract class ToolbarBase<P extends ToolbarProps = ToolbarProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'orientation']
    orientation: ToolbarProps['orientation'] = 'horizontal'
}
