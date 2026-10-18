import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TokenInputProps extends StudioProps {}

/** Headless behavior for the Token input component. */
export abstract class TokenInputBase extends StudioComponentBase<TokenInputProps> {
    readonly componentName = 'token-input'
    readonly componentKind: StudioKind = 'tokens'
}
