import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface StateSelectorProps extends StudioProps {}

/** Headless behavior for the State selector component. */
export abstract class StateSelectorBase extends StudioComponentBase<StateSelectorProps> {
    readonly componentName = 'state-selector'
    readonly componentKind: StudioKind = 'select'
}
