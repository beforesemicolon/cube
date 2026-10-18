import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ComponentOutlineProps extends StudioProps {}

/** Headless behavior for the Component outline component. */
export abstract class ComponentOutlineBase extends StudioComponentBase<ComponentOutlineProps> {
    readonly componentName = 'component-outline'
    readonly componentKind: StudioKind = 'canvas'
}
