import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PanelHeaderProps extends StudioProps {}

/** Headless behavior for the Panel header component. */
export abstract class PanelHeaderBase extends StudioComponentBase<PanelHeaderProps> {
    readonly componentName = 'panel-header'
    readonly componentKind: StudioKind = 'panel'
}
