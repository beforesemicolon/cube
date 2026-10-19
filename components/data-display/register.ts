import { register } from '../core/Component.js'
import { Badge } from './badge/index.js'
import { Avatar } from './avatar/index.js'
import { Card } from './card/index.js'
import { List } from './list/index.js'
import { DescriptionRow } from './description-row/index.js'
import { Table } from './table/index.js'
import { Tree } from './tree/index.js'
import { Accordion } from './accordion/index.js'
import { ExpandableSection } from './expandable-section/index.js'
import { FileBrowser } from './file-browser/index.js'
import { LayerTree } from './layer-tree/index.js'
import { CodePreview } from './code-preview/index.js'
export * from './badge/index.js'
export * from './CollectionBase.js'
export * from './avatar/index.js'
export * from './card/index.js'
export * from './list/index.js'
export * from './description-row/index.js'
export * from './table/index.js'
export * from './tree/index.js'
export * from './accordion/index.js'
export * from './expandable-section/index.js'
export * from './file-browser/index.js'
export * from './layer-tree/index.js'
export * from './code-preview/index.js'

export function registerDataDisplay(): void {
    register('cb-badge', Badge)
    register('cb-avatar', Avatar)
    register('cb-card', Card)
    register('cb-list', List)
    register('cb-description-row', DescriptionRow)
    register('cb-table', Table)
    register('cb-tree', Tree)
    register('cb-accordion', Accordion)
    register('cb-expandable-section', ExpandableSection)
    register('cb-file-browser', FileBrowser)
    register('cb-layer-tree', LayerTree)
    register('cb-code-preview', CodePreview)
}
