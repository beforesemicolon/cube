import './core/browser.js'
import { registerMedia } from './media/register.js'
export * from './media/register.js'

registerMedia()

export const ready = Promise.resolve()
