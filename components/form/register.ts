import { register } from '../core/Component.js'
import { Slider } from './slider/index.js'
import { Select } from './select/index.js'
import { RadioGroup } from './radio-group/index.js'
import { Calendar } from './calendar/index.js'
import { Field } from './field/index.js'
import { EditableList } from './editable-list/index.js'
import { CodeEditor } from './code-editor/index.js'
import { JsonEditor } from './json-editor/index.js'
import { LinkedValues } from './linked-values/index.js'
import { TextInput } from './text-input/index.js'
import { Textarea } from './textarea/index.js'
import { NumberInput } from './number-input/index.js'
import { UnitInput } from './unit-input/index.js'
import { Combobox } from './combobox/index.js'
import { Checkbox } from './checkbox/index.js'
import { Switch } from './switch/index.js'
import { RangeSlider } from './range-slider/index.js'
import { Stepper } from './stepper/index.js'
import { DatePicker } from './date-picker/index.js'
import { TimePicker } from './time-picker/index.js'
import { FilePicker } from './file-picker/index.js'
import { TokenInput } from './token-input/index.js'
import { EditableLabel } from './editable-label/index.js'
import { MaskedInput } from './masked-input/index.js'
export * from './slider/index.js'
export * from './FormControlBase.js'
export * from './NumericInputBase.js'
export * from './ChoiceControlBase.js'
export * from './select/index.js'
export * from './radio-group/index.js'
export * from './calendar/index.js'
export * from './field/index.js'
export * from './editable-list/index.js'
export * from './code-editor/index.js'
export * from './json-editor/index.js'
export * from './linked-values/index.js'
export { normalizeRange, normalizeOptions } from './model.js'
export * from './text-input/index.js'
export * from './textarea/index.js'
export * from './number-input/index.js'
export * from './unit-input/index.js'
export * from './combobox/index.js'
export * from './checkbox/index.js'
export * from './switch/index.js'
export * from './range-slider/index.js'
export * from './stepper/index.js'
export * from './date-picker/index.js'
export * from './time-picker/index.js'
export * from './file-picker/index.js'
export * from './token-input/index.js'
export * from './editable-label/index.js'
export * from './masked-input/index.js'

export function registerForm(): void {
    register('cb-slider', Slider)
    register('cb-select', Select)
    register('cb-radio-group', RadioGroup)
    register('cb-calendar', Calendar)
    register('cb-field', Field)
    register('cb-editable-list', EditableList)
    register('cb-code-editor', CodeEditor)
    register('cb-json-editor', JsonEditor)
    register('cb-linked-values', LinkedValues)
    register('cb-text-input', TextInput)
    register('cb-textarea', Textarea)
    register('cb-number-input', NumberInput)
    register('cb-unit-input', UnitInput)
    register('cb-combobox', Combobox)
    register('cb-checkbox', Checkbox)
    register('cb-switch', Switch)
    register('cb-range-slider', RangeSlider)
    register('cb-stepper', Stepper)
    register('cb-date-picker', DatePicker)
    register('cb-time-picker', TimePicker)
    register('cb-file-picker', FilePicker)
    register('cb-token-input', TokenInput)
    register('cb-editable-label', EditableLabel)
    register('cb-masked-input', MaskedInput)
}
