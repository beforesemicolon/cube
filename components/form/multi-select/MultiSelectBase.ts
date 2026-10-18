import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface MultiSelectProps extends StudioProps {}

/** Headless behavior for the Multi select component. */
export abstract class MultiSelectBase extends StudioComponentBase<MultiSelectProps> {
    readonly componentName = 'multi-select'
    readonly componentKind: StudioKind = 'select'
}
