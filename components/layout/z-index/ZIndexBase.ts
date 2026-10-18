import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ZIndexProps extends StudioProps {}

/** Headless behavior for the Z index component. */
export abstract class ZIndexBase extends StudioComponentBase<ZIndexProps> {
    readonly componentName = 'z-index'
    readonly componentKind: StudioKind = 'number'
}
