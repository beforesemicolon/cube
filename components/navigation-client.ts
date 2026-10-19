import './core/browser.js'
import { registerNavigation } from './navigation/register.js'
export * from './navigation/register.js'

registerNavigation()

export const ready = Promise.resolve()
