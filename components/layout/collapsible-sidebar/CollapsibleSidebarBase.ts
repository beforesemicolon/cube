import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface CollapsibleSidebarProps extends StudioProps {}

/** Headless behavior for the Collapsible sidebar component. */
export abstract class CollapsibleSidebarBase extends StudioComponentBase<CollapsibleSidebarProps> {
    readonly componentName = 'collapsible-sidebar'
    readonly componentKind: StudioKind = 'panel'
}
