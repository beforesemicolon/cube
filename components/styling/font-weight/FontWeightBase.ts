import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FontWeightProps extends StudioProps {}

/** Headless behavior for the Font weight component. */
export abstract class FontWeightBase extends StudioComponentBase<FontWeightProps> {
    readonly componentName = 'font-weight'
    readonly componentKind: StudioKind = 'select'
}
