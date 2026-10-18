import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface EyedropperProps extends StudioProps {}

/** Headless behavior for the Eyedropper component. */
export abstract class EyedropperBase extends StudioComponentBase<EyedropperProps> {
    readonly componentName = 'eyedropper'
    readonly componentKind: StudioKind = 'color'
}
