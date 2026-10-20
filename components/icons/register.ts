import { register } from '../core/Component.js'
import { Icon } from './icon/index.js'
export * from './icon/index.js'
export * from './registry.js'

export function registerIcons(): void {
    register('cb-icon', Icon)
}
