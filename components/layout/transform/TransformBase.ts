import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TransformProps extends StudioProps {}

/** Headless behavior for the Transform component. */
export abstract class TransformBase extends StudioComponentBase<TransformProps> {
    readonly componentName = 'transform'
    readonly componentKind: StudioKind = 'editor'
}
