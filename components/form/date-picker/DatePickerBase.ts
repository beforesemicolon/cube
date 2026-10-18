import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DatePickerProps extends StudioProps {}

/** Headless behavior for the Date picker component. */
export abstract class DatePickerBase extends StudioComponentBase<DatePickerProps> {
    readonly componentName = 'date-picker'
    readonly componentKind: StudioKind = 'text'
}
