import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ShortcutsProps extends StudioProps {}

/** Headless behavior for the Shortcuts component. */
export abstract class ShortcutsBase extends StudioComponentBase<ShortcutsProps> {
    readonly componentName = 'shortcuts'
    readonly componentKind: StudioKind = 'collection'
}
