import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface MaskedInputProps extends StudioProps {}

/** Headless behavior for the Masked input component. */
export abstract class MaskedInputBase extends StudioComponentBase<MaskedInputProps> {
    readonly componentName = 'masked-input'
    readonly componentKind: StudioKind = 'text'
}
