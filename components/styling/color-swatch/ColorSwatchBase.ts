import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ColorSwatchProps extends StudioProps {}

/** Headless behavior for the Color swatch component. */
export abstract class ColorSwatchBase extends StudioComponentBase<ColorSwatchProps> {
    readonly componentName = 'color-swatch'
    readonly componentKind: StudioKind = 'color'
}
