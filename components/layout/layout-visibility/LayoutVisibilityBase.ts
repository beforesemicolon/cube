import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface LayoutVisibilityProps extends StudioProps {}

/** Headless behavior for the Visibility component. */
export abstract class LayoutVisibilityBase extends StudioComponentBase<LayoutVisibilityProps> {
    readonly componentName = 'layout-visibility'
    readonly componentKind: StudioKind = 'choice'
}
