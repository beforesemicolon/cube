import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AlphaProps extends StudioProps {}

/** Headless behavior for the Alpha component. */
export abstract class AlphaBase extends StudioComponentBase<AlphaProps> {
    readonly componentName = 'alpha'
    readonly componentKind: StudioKind = 'range'
}
