import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AvatarProps extends StudioProps {}

/** Headless behavior for the Avatar component. */
export abstract class AvatarBase extends StudioComponentBase<AvatarProps> {
    readonly componentName = 'avatar'
    readonly componentKind: StudioKind = 'display'
}
