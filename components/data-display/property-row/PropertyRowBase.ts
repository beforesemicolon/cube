import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PropertyRowProps extends StudioProps {}

/** Headless behavior for the Property row component. */
export abstract class PropertyRowBase extends StudioComponentBase<PropertyRowProps> {
    readonly componentName = 'property-row'
    readonly componentKind: StudioKind = 'editor'
}
