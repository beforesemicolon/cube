import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface BoxModelProps extends StudioProps {}

/** Headless behavior for the Box model component. */
export abstract class BoxModelBase extends StudioComponentBase<BoxModelProps> {
    readonly componentName = 'box-model'
    readonly componentKind: StudioKind = 'editor'
}
