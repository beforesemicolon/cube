import { initializeRuntime, type CubeRuntime } from './runtime.js'

export type * from './Component.js'
export type { CubeRuntime } from './runtime.js'

export async function initializeCore(runtime: CubeRuntime): Promise<typeof import('./Component.js')> {
    initializeRuntime(runtime)
    return import('./Component.js')
}

export default initializeCore
