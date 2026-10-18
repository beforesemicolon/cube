import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface InlineTextProps extends StudioProps {}

/** Headless behavior for the Inline text component. */
export abstract class InlineTextBase extends StudioComponentBase<InlineTextProps> {
    readonly componentName = 'inline-text'
    readonly componentKind: StudioKind = 'text'
}
