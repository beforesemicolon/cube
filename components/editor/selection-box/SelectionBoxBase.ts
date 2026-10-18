import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SelectionBoxProps extends StudioProps {}

/** Headless behavior for the Selection box component. */
export abstract class SelectionBoxBase extends StudioComponentBase<SelectionBoxProps> {
    readonly componentName = 'selection-box'
    readonly componentKind: StudioKind = 'canvas'
}
