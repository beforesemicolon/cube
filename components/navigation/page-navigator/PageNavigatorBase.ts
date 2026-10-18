import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PageNavigatorProps extends StudioProps {}

/** Headless behavior for the Page navigator component. */
export abstract class PageNavigatorBase extends StudioComponentBase<PageNavigatorProps> {
    readonly componentName = 'page-navigator'
    readonly componentKind: StudioKind = 'collection'
}
