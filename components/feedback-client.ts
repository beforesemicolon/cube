import createComponents from 'cube:client/feedback'
import { browserRuntime } from './core/browser.js'

const { showFlashbar, createFlashbar, updateFlashbar, hideFlashbar, clearFlashbars, configureFlashbarHost, getFlashbarHost } = createComponents(browserRuntime())
const browser = globalThis as typeof globalThis & { BFS: { CUBE?: object } }
browser.BFS.CUBE = { showFlashbar, createFlashbar, updateFlashbar, hideFlashbar, clearFlashbars, configureFlashbarHost, getFlashbarHost, ...browser.BFS.CUBE }
