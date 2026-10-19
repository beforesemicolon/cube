import './core/browser.js'
import { registerForm } from './form/register.js'
export * from './form/register.js'

registerForm()

export const ready = Promise.resolve()
