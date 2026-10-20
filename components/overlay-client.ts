import './core/browser.js'
import { registerOverlay } from './overlay/register.js'
export * from './overlay/register.js'

registerOverlay()

export const ready = Promise.resolve()
