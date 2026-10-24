import createComponents from 'cube:client'
import { browserRuntime } from './core/browser.js'

const {
    normalizeRange, normalizeOptions,
    showModal, hideModal, closeAllModals, configureModalHost, getModalHost,
    showFlashbar, createFlashbar, updateFlashbar, hideFlashbar, clearFlashbars,
    configureFlashbarHost, getFlashbarHost,
    configureChartEngine, chartEngine, cartesianModel, pieModel,
    iconPaths, flattenTheme, cubeTheme, lightTokens, darkTokens, token,
} = createComponents(browserRuntime())
const browser = globalThis as typeof globalThis & { BFS: { CUBE?: object } }
browser.BFS.CUBE = {
    normalizeRange, normalizeOptions,
    showModal, hideModal, closeAllModals, configureModalHost, getModalHost,
    showFlashbar, createFlashbar, updateFlashbar, hideFlashbar, clearFlashbars,
    configureFlashbarHost, getFlashbarHost,
    configureChartEngine, chartEngine, cartesianModel, pieModel,
    iconPaths, flattenTheme, cubeTheme, lightTokens, darkTokens, token,
    ...browser.BFS.CUBE,
}
