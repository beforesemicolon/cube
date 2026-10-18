import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ActivityLogProps extends StudioProps {}

/** Headless behavior for the Activity log component. */
export abstract class ActivityLogBase extends StudioComponentBase<ActivityLogProps> {
    readonly componentName = 'activity-log'
    readonly componentKind: StudioKind = 'collection'
}
