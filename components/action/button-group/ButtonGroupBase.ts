import { UIComponent, type UIProps } from '../../core/UIComponent.js'

export interface ButtonGroupProps extends UIProps { orientation?: 'horizontal' | 'vertical' }

/** Group labeling, disabled state and orientation without choosing child actions. */
export abstract class ButtonGroupBase<P extends ButtonGroupProps = ButtonGroupProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'orientation']
    orientation: ButtonGroupProps['orientation'] = 'horizontal'
}
