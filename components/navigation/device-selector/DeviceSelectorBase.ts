import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DeviceSelectorProps extends StudioProps {}

/** Headless behavior for the Device selector component. */
export abstract class DeviceSelectorBase extends StudioComponentBase<DeviceSelectorProps> {
    readonly componentName = 'device-selector'
    readonly componentKind: StudioKind = 'select'
}
