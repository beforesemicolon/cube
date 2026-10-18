import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AssetSidebarProps extends StudioProps {}

/** Headless behavior for the Asset sidebar component. */
export abstract class AssetSidebarBase extends StudioComponentBase<AssetSidebarProps> {
    readonly componentName = 'asset-sidebar'
    readonly componentKind: StudioKind = 'shell'
}
