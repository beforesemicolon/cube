import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface NestedMenuProps extends StudioProps {}

/** Headless behavior for the Nested menu component. */
export abstract class NestedMenuBase extends StudioComponentBase<NestedMenuProps> {
    readonly componentName = 'nested-menu'
    readonly componentKind: StudioKind = 'collection'
}
