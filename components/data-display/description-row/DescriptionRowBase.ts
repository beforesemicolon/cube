import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DescriptionRowProps extends StudioProps {}

/** Headless behavior for the Description row component. */
export abstract class DescriptionRowBase extends StudioComponentBase<DescriptionRowProps> {
    readonly componentName = 'description-row'
    readonly componentKind: StudioKind = 'display'
}
