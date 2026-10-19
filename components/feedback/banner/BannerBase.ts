import { MessageBase, type MessageProps } from '../MessageBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface BannerProps extends MessageProps {}

/** Headless behavior for the Banner component. */
export abstract class BannerBase extends MessageBase<BannerProps> {
    readonly componentName = 'banner'
    readonly componentKind: StudioKind = 'status'
}
