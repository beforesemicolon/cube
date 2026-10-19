import { InputBase, type InputProps } from '../InputBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface TextareaProps extends InputProps {}

/** Headless behavior for the Textarea component. */
export abstract class TextareaBase extends InputBase<TextareaProps> {
    readonly componentName = 'textarea'
    readonly componentKind: StudioKind = 'textarea'
}
