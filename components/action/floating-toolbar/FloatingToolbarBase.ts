import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FloatingToolbarProps extends StudioProps {}

/** Headless behavior for the Floating toolbar component. */
export abstract class FloatingToolbarBase extends StudioComponentBase<FloatingToolbarProps> {
    readonly componentName = 'floating-toolbar'
    readonly componentKind: StudioKind = 'panel'
}
