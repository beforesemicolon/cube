import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface BlendModeProps extends StudioProps {}

/** Headless behavior for the Blend mode component. */
export abstract class BlendModeBase extends StudioComponentBase<BlendModeProps> {
    readonly componentName = 'blend-mode'
    readonly componentKind: StudioKind = 'select'
}
