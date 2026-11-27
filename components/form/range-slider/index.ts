import { register } from '../../core/Component.js'
import { RangeInput } from '../range-input/index.js'

/** @deprecated Use RangeInput from @beforesemicolon/cube/form/range-input. */
export class RangeSlider extends RangeInput {
    readonly componentName = 'range-slider'
}

export { RangeInputBase as RangeSliderBase } from '../range-input/RangeInputBase.js'
export type {
    RangeInputProps as RangeSliderProps,
    RangeInputVariant as RangeSliderVariant,
    RangeInputValue as RangeSliderValue,
    RangeInputThumb as RangeSliderThumb,
    RangeInputChangeDetail as RangeSliderChangeDetail,
} from '../range-input/RangeInputBase.js'

register('cb-range-slider', RangeSlider)
