import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TableProps extends StudioProps {}

/** Headless behavior for the Table component. */
export abstract class TableBase extends StudioComponentBase<TableProps> {
    readonly componentName = 'table'
    readonly componentKind: StudioKind = 'collection'
}
