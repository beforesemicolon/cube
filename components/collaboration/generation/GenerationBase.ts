import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface GenerationProps extends StudioProps {}

/** Headless behavior for the Generation component. */
export abstract class GenerationBase extends StudioComponentBase<GenerationProps> {
    readonly componentName = 'generation'
    readonly componentKind: StudioKind = 'progress'
}
