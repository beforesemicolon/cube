import { register } from '../core/Component.js'
import { ColorPicker } from './color-picker/index.js'
import { GradientEditor } from './gradient-editor/index.js'
export * from './color-picker/index.js'
export * from './gradient-editor/index.js'

export function registerStyling(): void {
    register('cb-color-picker', ColorPicker)
    register('cb-gradient-editor', GradientEditor)
}
