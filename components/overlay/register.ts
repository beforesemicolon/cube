import { register } from '../core/Component.js'
import { ContextMenu } from './context-menu/index.js'
import { Dropdown } from './dropdown/index.js'
import { CommandPalette } from './command-palette/index.js'
import { Tooltip } from './tooltip/index.js'
import { Modal } from './modal/index.js'
import { AlertDialog } from './alert-dialog/index.js'
import { Popover } from './popover/index.js'
import { Drawer } from './drawer/index.js'
import { HoverCard } from './hover-card/index.js'
import { BottomSheet } from './bottom-sheet/index.js'
export * from './context-menu/index.js'
export * from './dropdown/index.js'
export * from './command-palette/index.js'
export * from './tooltip/index.js'
export * from './modal/index.js'
export * from './alert-dialog/index.js'
export * from './popover/index.js'
export * from './drawer/index.js'
export * from './hover-card/index.js'
export * from './bottom-sheet/index.js'

export function registerOverlay(): void {
    register('cb-context-menu', ContextMenu)
    register('cb-dropdown', Dropdown)
    register('cb-command-palette', CommandPalette)
    register('cb-tooltip', Tooltip)
    register('cb-modal', Modal)
    register('cb-alert-dialog', AlertDialog)
    register('cb-popover', Popover)
    register('cb-drawer', Drawer)
    register('cb-hover-card', HoverCard)
    register('cb-bottom-sheet', BottomSheet)
}
