import createComponents from 'cube:client/overlay'
import { browserRuntime } from './core/browser.js'

const { showModal, hideModal, closeAllModals, configureModalHost, getModalHost } = createComponents(browserRuntime())
const browser = globalThis as typeof globalThis & { BFS: { CUBE?: object } }
browser.BFS.CUBE = { showModal, hideModal, closeAllModals, configureModalHost, getModalHost, ...browser.BFS.CUBE }
