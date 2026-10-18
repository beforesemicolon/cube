import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ColorPickerProps extends StudioProps {}

/** Headless behavior for the Color picker component. */
export abstract class ColorPickerBase extends StudioComponentBase<ColorPickerProps> {
    readonly componentName = 'color-picker'
    readonly componentKind: StudioKind = 'color'
}
