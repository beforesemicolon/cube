import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface HistoryProps extends StudioProps {}

/** Headless behavior for the History component. */
export abstract class HistoryBase extends StudioComponentBase<HistoryProps> {
    readonly componentName = 'history'
    readonly componentKind: StudioKind = 'collection'
}
