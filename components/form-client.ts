import createComponents from 'cube:client/form'
import { browserRuntime } from './core/browser.js'

const { normalizeRange, normalizeOptions } = createComponents(browserRuntime())
const browser = globalThis as typeof globalThis & { BFS: { CUBE?: object } }
browser.BFS.CUBE = { normalizeRange, normalizeOptions, ...browser.BFS.CUBE }
