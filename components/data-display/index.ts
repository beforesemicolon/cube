import { initializeRuntime, type CubeRuntime } from '../core/runtime.js'
export type * from './register.js'

export async function initializeDataDisplay(runtime: CubeRuntime): Promise<typeof import('./register.js')> {
    initializeRuntime(runtime)
    const category = await import('./register.js')
    category.registerDataDisplay()
    return category
}

export default initializeDataDisplay
