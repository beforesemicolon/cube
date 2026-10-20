import * as runtime from '@beforesemicolon/web-component'
import { initializeCube } from '../components/initialize.js'
import { currentRuntime } from '../components/core/runtime.js'

await initializeCube(currentRuntime() ?? runtime)
