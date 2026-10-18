import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ResizablePanelProps extends StudioProps {}

/** Headless behavior for the Resizable panel component. */
export abstract class ResizablePanelBase extends StudioComponentBase<ResizablePanelProps> {
    readonly componentName = 'resizable-panel'
    readonly componentKind: StudioKind = 'panel'
}
