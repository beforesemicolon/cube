import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PanelTabsProps extends StudioProps {}

/** Headless behavior for the Panel tabs component. */
export abstract class PanelTabsBase extends StudioComponentBase<PanelTabsProps> {
    readonly componentName = 'panel-tabs'
    readonly componentKind: StudioKind = 'collection'
}
