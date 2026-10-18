import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AlignmentProps extends StudioProps {}

/** Headless behavior for the Alignment component. */
export abstract class AlignmentBase extends StudioComponentBase<AlignmentProps> {
    readonly componentName = 'alignment'
    readonly componentKind: StudioKind = 'collection'
}
