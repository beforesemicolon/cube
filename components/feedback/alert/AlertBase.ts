import { MessageBase, type MessageProps } from '../MessageBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface AlertProps extends MessageProps {}

/** Headless behavior for the Alert component. */
export abstract class AlertBase extends MessageBase<AlertProps> {
    readonly componentName = 'alert'
    readonly componentKind: StudioKind = 'status'
}
