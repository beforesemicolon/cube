import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface MediaPreviewProps extends StudioProps {}

/** Headless behavior for the Media preview component. */
export abstract class MediaPreviewBase extends StudioComponentBase<MediaPreviewProps> {
    readonly componentName = 'media-preview'
    readonly componentKind: StudioKind = 'display'
}
