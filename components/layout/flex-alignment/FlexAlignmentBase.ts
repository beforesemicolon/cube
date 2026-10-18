import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FlexAlignmentProps extends StudioProps {}

/** Headless behavior for the Flex alignment component. */
export abstract class FlexAlignmentBase extends StudioComponentBase<FlexAlignmentProps> {
    readonly componentName = 'flex-alignment'
    readonly componentKind: StudioKind = 'collection'
}
