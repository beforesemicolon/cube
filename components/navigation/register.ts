import { register } from '../core/Component.js'
import { Link } from './link/index.js'
import { SegmentedControl } from './segmented-control/index.js'
import { Tabs } from './tabs/index.js'
import { Breadcrumb } from './breadcrumb/index.js'
import { Menu } from './menu/index.js'
import { Pagination } from './pagination/index.js'
export * from './link/index.js'
export * from './segmented-control/index.js'
export * from './tabs/index.js'
export * from './breadcrumb/index.js'
export * from './menu/index.js'
export * from './pagination/index.js'

export function registerNavigation(): void {
    register('cb-link', Link)
    register('cb-segmented-control', SegmentedControl)
    register('cb-tabs', Tabs)
    register('cb-breadcrumb', Breadcrumb)
    register('cb-menu', Menu)
    register('cb-pagination', Pagination)
}
