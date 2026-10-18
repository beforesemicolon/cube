import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface InsertionProps extends StudioProps {}

/** Headless behavior for the Insertion component. */
export abstract class InsertionBase extends StudioComponentBase<InsertionProps> {
    readonly componentName = 'insertion'
    readonly componentKind: StudioKind = 'canvas'
}
