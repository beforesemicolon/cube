import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ImageBrowserProps extends StudioProps {}

/** Headless behavior for the Image browser component. */
export abstract class ImageBrowserBase extends StudioComponentBase<ImageBrowserProps> {
    readonly componentName = 'image-browser'
    readonly componentKind: StudioKind = 'collection'
}
