import './core/browser.js'
import { registerFeedback } from './feedback/register.js'
export * from './feedback/register.js'

registerFeedback()

export const ready = Promise.resolve()
