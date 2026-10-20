import { initializeRuntime, type CubeRuntime } from '../core/runtime.js'
export type * from './register.js'

export async function initializeLayout(runtime: CubeRuntime): Promise<typeof import('./register.js')> {
    initializeRuntime(runtime)
    const category = await import('./register.js')
    category.registerLayout()
    return category
}

export default initializeLayout
