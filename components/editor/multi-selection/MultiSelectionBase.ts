import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface MultiSelectionProps extends StudioProps {}

/** Headless behavior for the Multi selection component. */
export abstract class MultiSelectionBase extends StudioComponentBase<MultiSelectionProps> {
    readonly componentName = 'multi-selection'
    readonly componentKind: StudioKind = 'canvas'
}
