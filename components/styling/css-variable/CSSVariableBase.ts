import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface CSSVariableProps extends StudioProps {}

/** Headless behavior for the CSS variable component. */
export abstract class CSSVariableBase extends StudioComponentBase<CSSVariableProps> {
    readonly componentName = 'css-variable'
    readonly componentKind: StudioKind = 'text'
}
