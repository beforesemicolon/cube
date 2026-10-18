import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TypographyProps extends StudioProps {}

/** Headless behavior for the Typography component. */
export abstract class TypographyBase extends StudioComponentBase<TypographyProps> {
    readonly componentName = 'typography'
    readonly componentKind: StudioKind = 'editor'
}
