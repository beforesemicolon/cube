import './core/browser.js'
import { registerStyling } from './styling/register.js'
export * from './styling/register.js'

registerStyling()

export const ready = Promise.resolve()
