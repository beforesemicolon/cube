import { register } from '../core/Component.js'
import { Heading } from './heading/index.js'
import { Shortcut } from './shortcut/index.js'
export * from './heading/index.js'
export * from './shortcut/index.js'

export function registerText(): void {
    register('cb-heading', Heading)
    register('cb-shortcut', Shortcut)
}
