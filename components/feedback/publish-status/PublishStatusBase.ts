import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PublishStatusProps extends StudioProps {}

/** Headless behavior for the Publish status component. */
export abstract class PublishStatusBase extends StudioComponentBase<PublishStatusProps> {
    readonly componentName = 'publish-status'
    readonly componentKind: StudioKind = 'status'
}
