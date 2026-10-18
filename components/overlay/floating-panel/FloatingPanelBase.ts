import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FloatingPanelProps extends StudioProps {}

/** Headless behavior for the Floating panel component. */
export abstract class FloatingPanelBase extends StudioComponentBase<FloatingPanelProps> {
    readonly componentName = 'floating-panel'
    readonly componentKind: StudioKind = 'panel'
}
