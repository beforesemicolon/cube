import './core/browser.js'
import { registerText } from './text/register.js'
export * from './text/register.js'

registerText()

export const ready = Promise.resolve()
