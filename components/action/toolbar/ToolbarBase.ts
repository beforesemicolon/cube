import { UIComponent, type UIProps } from '../../core/UIComponent.js'

export interface ToolbarProps extends UIProps { orientation?: 'horizontal' | 'vertical' }

/** Toolbar semantics independent of the actions slotted into it. */
export abstract class ToolbarBase<P extends ToolbarProps = ToolbarProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'orientation']
    orientation: ToolbarProps['orientation'] = 'horizontal'
}
