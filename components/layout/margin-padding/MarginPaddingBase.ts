import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface MarginPaddingProps extends StudioProps {}

/** Headless behavior for the Margin padding component. */
export abstract class MarginPaddingBase extends StudioComponentBase<MarginPaddingProps> {
    readonly componentName = 'margin-padding'
    readonly componentKind: StudioKind = 'editor'
}
