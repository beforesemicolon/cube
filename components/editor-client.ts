import './core/browser.js'
import { registerEditor } from './editor/register.js'
export * from './editor/register.js'

registerEditor()

export const ready = Promise.resolve()
