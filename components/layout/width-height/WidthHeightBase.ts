import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface WidthHeightProps extends StudioProps {}

/** Headless behavior for the Width height component. */
export abstract class WidthHeightBase extends StudioComponentBase<WidthHeightProps> {
    readonly componentName = 'width-height'
    readonly componentKind: StudioKind = 'editor'
}
