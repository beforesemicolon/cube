import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface InspectorSidebarProps extends StudioProps {}

/** Headless behavior for the Inspector sidebar component. */
export abstract class InspectorSidebarBase extends StudioComponentBase<InspectorSidebarProps> {
    readonly componentName = 'inspector-sidebar'
    readonly componentKind: StudioKind = 'shell'
}
