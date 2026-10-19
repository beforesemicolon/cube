import { register } from '../core/Component.js'
import { Button } from './button/index.js'
import { SplitButton } from './split-button/index.js'
import { ButtonGroup } from './button-group/index.js'
export * from './button/index.js'
export * from './split-button/index.js'
export * from './button-group/index.js'

export function registerAction(): void {
    register('cb-button', Button)
    register('cb-split-button', SplitButton)
    register('cb-button-group', ButtonGroup)
}
