import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DesignTokenProps extends StudioProps {}

/** Headless behavior for the Design token component. */
export abstract class DesignTokenBase extends StudioComponentBase<DesignTokenProps> {
    readonly componentName = 'design-token'
    readonly componentKind: StudioKind = 'tokens'
}
