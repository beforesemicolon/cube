import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AlignmentGuideProps extends StudioProps {}

/** Headless behavior for the Alignment guide component. */
export abstract class AlignmentGuideBase extends StudioComponentBase<AlignmentGuideProps> {
    readonly componentName = 'alignment-guide'
    readonly componentKind: StudioKind = 'canvas'
}
