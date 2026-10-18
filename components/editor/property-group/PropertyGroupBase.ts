import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PropertyGroupProps extends StudioProps {}

/** Headless behavior for the Property group component. */
export abstract class PropertyGroupBase extends StudioComponentBase<PropertyGroupProps> {
    readonly componentName = 'property-group'
    readonly componentKind: StudioKind = 'panel'
}
