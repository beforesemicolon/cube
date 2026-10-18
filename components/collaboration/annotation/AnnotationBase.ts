import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AnnotationProps extends StudioProps {}

/** Headless behavior for the Annotation component. */
export abstract class AnnotationBase extends StudioComponentBase<AnnotationProps> {
    readonly componentName = 'annotation'
    readonly componentKind: StudioKind = 'collaboration'
}
