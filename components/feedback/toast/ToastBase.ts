import { MessageBase, type MessageProps } from '../MessageBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface ToastProps extends MessageProps {}

/** Headless behavior for the Toast component. */
export abstract class ToastBase extends MessageBase<ToastProps> {
    readonly componentName = 'toast'
    readonly componentKind: StudioKind = 'status'
}
