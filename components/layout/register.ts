import { register } from '../core/Component.js'
import { Box } from './box/index.js'
import { Row } from './row/index.js'
import { Col } from './col/index.js'
import { Grid } from './grid/index.js'
import { Divider } from './divider/index.js'
import { Toolbar } from './toolbar/index.js'
import { ActionBar } from './action-bar/index.js'
import { Sidebar } from './sidebar/index.js'
import { ResizablePanel } from './resizable-panel/index.js'
import { DockedPanel } from './docked-panel/index.js'
import { PanelHeader } from './panel-header/index.js'
import { Workspace } from './workspace/index.js'
export * from './box/index.js'
export * from './row/index.js'
export * from './col/index.js'
export * from './grid/index.js'
export * from './divider/index.js'
export * from './toolbar/index.js'
export * from './action-bar/index.js'
export * from './sidebar/index.js'
export * from './resizable-panel/index.js'
export * from './docked-panel/index.js'
export * from './panel-header/index.js'
export * from './workspace/index.js'

export function registerLayout(): void {
    register('cb-box', Box)
    register('cb-row', Row)
    register('cb-col', Col)
    register('cb-grid', Grid)
    register('cb-divider', Divider)
    register('cb-toolbar', Toolbar)
    register('cb-action-bar', ActionBar)
    register('cb-sidebar', Sidebar)
    register('cb-resizable-panel', ResizablePanel)
    register('cb-docked-panel', DockedPanel)
    register('cb-panel-header', PanelHeader)
    register('cb-workspace', Workspace)
}
