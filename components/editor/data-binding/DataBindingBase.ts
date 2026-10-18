import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DataBindingProps extends StudioProps {}

/** Headless behavior for the Data binding component. */
export abstract class DataBindingBase extends StudioComponentBase<DataBindingProps> {
    readonly componentName = 'data-binding'
    readonly componentKind: StudioKind = 'editor'
}
