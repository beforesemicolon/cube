import createComponents from 'cube:client/theme'
import { browserRuntime } from './core/browser.js'

const { flattenTheme, cubeTheme, lightTokens, darkTokens, token } = createComponents(browserRuntime())
const browser = globalThis as typeof globalThis & { BFS: { CUBE?: object } }
browser.BFS.CUBE = { flattenTheme, cubeTheme, lightTokens, darkTokens, token, ...browser.BFS.CUBE }
