import { MessageBase, type MessageProps } from '../MessageBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface StatusProps extends MessageProps {}

/** Headless behavior for the Status component. */
export abstract class StatusBase extends MessageBase<StatusProps> {
    readonly componentName = 'status'
    readonly componentKind: StudioKind = 'status'
}
