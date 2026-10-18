import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DockedPanelProps extends StudioProps {}

/** Headless behavior for the Docked panel component. */
export abstract class DockedPanelBase extends StudioComponentBase<DockedPanelProps> {
    readonly componentName = 'docked-panel'
    readonly componentKind: StudioKind = 'panel'
}
