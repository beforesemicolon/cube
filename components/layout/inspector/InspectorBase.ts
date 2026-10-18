import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface InspectorProps extends StudioProps {}

/** Headless behavior for the Inspector component. */
export abstract class InspectorBase extends StudioComponentBase<InspectorProps> {
    readonly componentName = 'inspector'
    readonly componentKind: StudioKind = 'panel'
}
