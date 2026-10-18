import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FlexDirectionProps extends StudioProps {}

/** Headless behavior for the Flex direction component. */
export abstract class FlexDirectionBase extends StudioComponentBase<FlexDirectionProps> {
    readonly componentName = 'flex-direction'
    readonly componentKind: StudioKind = 'collection'
}
