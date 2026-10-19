import './core/browser.js'
import { registerCharts } from './charts/register.js'
export * from './charts/register.js'

registerCharts()

export const ready = Promise.resolve()
