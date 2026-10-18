import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ZoomProps extends StudioProps {}

/** Headless behavior for the Zoom component. */
export abstract class ZoomBase extends StudioComponentBase<ZoomProps> {
    readonly componentName = 'zoom'
    readonly componentKind: StudioKind = 'range'
}
