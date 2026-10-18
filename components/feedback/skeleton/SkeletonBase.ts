import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SkeletonProps extends StudioProps {}

/** Headless behavior for the Skeleton component. */
export abstract class SkeletonBase extends StudioComponentBase<SkeletonProps> {
    readonly componentName = 'skeleton'
    readonly componentKind: StudioKind = 'status'
}
