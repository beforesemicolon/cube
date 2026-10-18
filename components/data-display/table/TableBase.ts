import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TableProps extends StudioProps {
    nameLabel?: string
    metadataLabel?: string
}

/** Headless behavior for the Table component. */
export abstract class TableBase extends StudioComponentBase<TableProps> {
    static observedAttributes = [...StudioComponentBase.observedAttributes, 'name-label', 'metadata-label']
    nameLabel = ''
    metadataLabel = ''
    readonly componentName = 'table'
    readonly componentKind: StudioKind = 'collection'
}
