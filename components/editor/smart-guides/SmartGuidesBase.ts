import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SmartGuidesProps extends StudioProps {}

/** Headless behavior for the Smart guides component. */
export abstract class SmartGuidesBase extends StudioComponentBase<SmartGuidesProps> {
    readonly componentName = 'smart-guides'
    readonly componentKind: StudioKind = 'canvas'
}
