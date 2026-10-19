import { InputBase, type InputProps } from './InputBase.js'

export interface NumericInputProps extends InputProps {
    min?: number
    max?: number
    step?: number
}

/** Numeric bounds shared by number, unit, range, and stepper controls. */
export abstract class NumericInputBase<P extends NumericInputProps = NumericInputProps> extends InputBase<P> {
    static observedAttributes = [...InputBase.observedAttributes, 'min', 'max', 'step']
    min = 0
    max = 100
    step = 1
}
