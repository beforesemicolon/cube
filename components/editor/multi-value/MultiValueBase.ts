import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface MultiValueProps extends StudioProps {}

/** Headless behavior for the Multi value component. */
export abstract class MultiValueBase extends StudioComponentBase<MultiValueProps> {
    readonly componentName = 'multi-value'
    readonly componentKind: StudioKind = 'editor'
}
