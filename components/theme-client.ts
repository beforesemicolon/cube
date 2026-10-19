import './core/browser.js'
import { registerTheme } from './theme/register.js'
export * from './theme/register.js'

registerTheme()

export const ready = Promise.resolve()
