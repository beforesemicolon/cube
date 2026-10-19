import { Component, type ComponentProps } from '../core/Component.js'

export interface ChoiceControlProps extends ComponentProps {
    checked?: boolean
    required?: boolean
}

/** Binary checked state shared by checkbox-like controls. */
export abstract class ChoiceControlBase<P extends ChoiceControlProps = ChoiceControlProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'checked', 'required']
    checked = false
    required = false
}
