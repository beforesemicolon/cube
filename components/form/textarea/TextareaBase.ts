import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TextareaProps extends StudioProps {}

/** Headless behavior for the Textarea component. */
export abstract class TextareaBase extends StudioComponentBase<TextareaProps> {
    readonly componentName = 'textarea'
    readonly componentKind: StudioKind = 'textarea'
}
