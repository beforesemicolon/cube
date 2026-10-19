import { Component, type ComponentProps } from '../core/Component.js'
import type { StudioValue } from '../studio/types.js'

export interface InputProps extends ComponentProps {
    value?: StudioValue
    placeholder?: string
    readOnly?: boolean
}

/** Value and editing behavior shared by primitive input controls. */
export abstract class InputBase<P extends InputProps = InputProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'value', 'placeholder', 'read-only']
    value: StudioValue = ''
    placeholder = ''
    readOnly = false
}
