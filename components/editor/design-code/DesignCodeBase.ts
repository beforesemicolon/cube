import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DesignCodeProps extends StudioProps {}

/** Headless behavior for the Design code component. */
export abstract class DesignCodeBase extends StudioComponentBase<DesignCodeProps> {
    readonly componentName = 'design-code'
    readonly componentKind: StudioKind = 'collection'
}
