import { register } from '../core/Component.js'
import { CartesianChart } from './cartesian-chart/index.js'
import { PieChart } from './pie-chart/index.js'
export * from './cartesian-chart/index.js'
export * from './pie-chart/index.js'
export * from './ChartBase.js'
export * from './model.js'
export * from './engine.js'

export function registerCharts(): void {
    register('cb-cartesian-chart', CartesianChart)
    register('cb-pie-chart', PieChart)
}
