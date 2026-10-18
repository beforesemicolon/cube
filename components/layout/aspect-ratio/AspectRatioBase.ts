import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AspectRatioProps extends StudioProps {}

/** Headless behavior for the Aspect ratio component. */
export abstract class AspectRatioBase extends StudioComponentBase<AspectRatioProps> {
    readonly componentName = 'aspect-ratio'
    readonly componentKind: StudioKind = 'text'
}
