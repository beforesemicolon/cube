import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PageThumbnailProps extends StudioProps {}

/** Headless behavior for the Page thumbnail component. */
export abstract class PageThumbnailBase extends StudioComponentBase<PageThumbnailProps> {
    readonly componentName = 'page-thumbnail'
    readonly componentKind: StudioKind = 'display'
}
