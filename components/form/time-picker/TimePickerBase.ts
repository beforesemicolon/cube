import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TimePickerProps extends StudioProps {}

/** Headless behavior for the Time picker component. */
export abstract class TimePickerBase extends StudioComponentBase<TimePickerProps> {
    readonly componentName = 'time-picker'
    readonly componentKind: StudioKind = 'text'
}
