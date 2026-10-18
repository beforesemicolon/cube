import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TextInputProps extends StudioProps {}

/** Headless behavior for the Text input component. */
export abstract class TextInputBase extends StudioComponentBase<TextInputProps> {
    readonly componentName = 'text-input'
    readonly componentKind: StudioKind = 'text'
}
