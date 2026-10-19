import { InputBase, type InputProps } from '../InputBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface TextInputProps extends InputProps {}

/** Headless behavior for the Text input component. */
export abstract class TextInputBase extends InputBase<TextInputProps> {
    readonly componentName = 'text-input'
    readonly componentKind: StudioKind = 'text'
}
