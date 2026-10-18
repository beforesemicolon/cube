import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface LockProps extends StudioProps {}

/** Headless behavior for the Lock component. */
export abstract class LockBase extends StudioComponentBase<LockProps> {
    readonly componentName = 'lock'
    readonly componentKind: StudioKind = 'choice'
}
