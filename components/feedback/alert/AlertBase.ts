import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AlertProps extends StudioProps {}

/** Headless behavior for the Alert component. */
export abstract class AlertBase extends StudioComponentBase<AlertProps> {
    readonly componentName = 'alert'
    readonly componentKind: StudioKind = 'status'
}
