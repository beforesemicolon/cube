import './core/browser.js'
import { registerAction } from './action/register.js'
export * from './action/register.js'

registerAction()

export const ready = Promise.resolve()
