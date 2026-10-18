import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface BannerProps extends StudioProps {}

/** Headless behavior for the Banner component. */
export abstract class BannerBase extends StudioComponentBase<BannerProps> {
    readonly componentName = 'banner'
    readonly componentKind: StudioKind = 'status'
}
