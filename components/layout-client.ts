import './core/browser.js'
import { registerLayout } from './layout/register.js'
export * from './layout/register.js'

registerLayout()

export const ready = Promise.resolve()
