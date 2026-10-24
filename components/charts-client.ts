import createComponents from 'cube:client/charts'
import { browserRuntime } from './core/browser.js'

const { configureChartEngine, chartEngine, cartesianModel, pieModel } = createComponents(browserRuntime())
const browser = globalThis as typeof globalThis & { BFS: { CUBE?: object } }
browser.BFS.CUBE = { configureChartEngine, chartEngine, cartesianModel, pieModel, ...browser.BFS.CUBE }
