import { ProgressIndicatorBase, type ProgressIndicatorProps } from '../ProgressIndicatorBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface ProgressProps extends ProgressIndicatorProps {}

/** Headless behavior for the Progress component. */
export abstract class ProgressBase extends ProgressIndicatorBase<ProgressProps> {
    readonly componentName = 'progress'
    readonly componentKind: StudioKind = 'progress'
}
