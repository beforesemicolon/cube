import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DeviceFrameProps extends StudioProps {}

/** Headless behavior for the Device frame component. */
export abstract class DeviceFrameBase extends StudioComponentBase<DeviceFrameProps> {
    readonly componentName = 'device-frame'
    readonly componentKind: StudioKind = 'canvas'
}
