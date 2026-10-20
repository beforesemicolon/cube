import { initializeRuntime, type CubeRuntime } from '../core/runtime.js'
export type * from './register.js'

export async function initializeAction(runtime: CubeRuntime): Promise<typeof import('./register.js')> {
    initializeRuntime(runtime)
    const category = await import('./register.js')
    category.registerAction()
    return category
}

export default initializeAction
