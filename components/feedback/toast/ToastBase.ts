import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ToastProps extends StudioProps {}

/** Headless behavior for the Toast component. */
export abstract class ToastBase extends StudioComponentBase<ToastProps> {
    readonly componentName = 'toast'
    readonly componentKind: StudioKind = 'status'
}
