import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ImageBackgroundProps extends StudioProps {}

/** Headless behavior for the Image background component. */
export abstract class ImageBackgroundBase extends StudioComponentBase<ImageBackgroundProps> {
    readonly componentName = 'image-background'
    readonly componentKind: StudioKind = 'file'
}
