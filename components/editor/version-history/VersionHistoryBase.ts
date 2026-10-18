import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface VersionHistoryProps extends StudioProps {}

/** Headless behavior for the Version history component. */
export abstract class VersionHistoryBase extends StudioComponentBase<VersionHistoryProps> {
    readonly componentName = 'version-history'
    readonly componentKind: StudioKind = 'collection'
}
