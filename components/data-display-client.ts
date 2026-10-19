import './core/browser.js'
import { registerDataDisplay } from './data-display/register.js'
export * from './data-display/register.js'

registerDataDisplay()

export const ready = Promise.resolve()
