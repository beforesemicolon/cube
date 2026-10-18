import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DrawerProps extends StudioProps {}

/** Headless behavior for the Drawer component. */
export abstract class DrawerBase extends StudioComponentBase<DrawerProps> {
    readonly componentName = 'drawer'
    readonly componentKind: StudioKind = 'panel'
}
