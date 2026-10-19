import './core/browser.js'
import { registerIcons } from './icons/register.js'
export * from './icons/register.js'

registerIcons()

export const ready = Promise.resolve()
