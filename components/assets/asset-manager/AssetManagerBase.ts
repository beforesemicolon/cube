import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AssetManagerProps extends StudioProps {}

/** Headless behavior for the Asset manager component. */
export abstract class AssetManagerBase extends StudioComponentBase<AssetManagerProps> {
    readonly componentName = 'asset-manager'
    readonly componentKind: StudioKind = 'collection'
}
