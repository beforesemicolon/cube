import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PropertiesInspectorProps extends StudioProps {}

/** Headless behavior for the Properties inspector component. */
export abstract class PropertiesInspectorBase extends StudioComponentBase<PropertiesInspectorProps> {
    readonly componentName = 'properties-inspector'
    readonly componentKind: StudioKind = 'panel'
}
