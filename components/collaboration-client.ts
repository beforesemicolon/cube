import './core/browser.js'
import { registerCollaboration } from './collaboration/register.js'
export * from './collaboration/register.js'

registerCollaboration()

export const ready = Promise.resolve()
