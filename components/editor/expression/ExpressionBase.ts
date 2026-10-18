import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ExpressionProps extends StudioProps {}

/** Headless behavior for the Expression component. */
export abstract class ExpressionBase extends StudioComponentBase<ExpressionProps> {
    readonly componentName = 'expression'
    readonly componentKind: StudioKind = 'text'
}
