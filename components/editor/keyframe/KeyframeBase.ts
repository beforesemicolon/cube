import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface KeyframeProps extends StudioProps {}

/** Headless behavior for the Keyframe component. */
export abstract class KeyframeBase extends StudioComponentBase<KeyframeProps> {
    readonly componentName = 'keyframe'
    readonly componentKind: StudioKind = 'editor'
}
