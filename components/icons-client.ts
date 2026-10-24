import createComponents from 'cube:client/icons'
import { browserRuntime } from './core/browser.js'

const { iconPaths } = createComponents(browserRuntime())
const browser = globalThis as typeof globalThis & { BFS: { CUBE?: object } }
browser.BFS.CUBE = { iconPaths, ...browser.BFS.CUBE }
