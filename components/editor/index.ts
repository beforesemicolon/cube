import { initializeRuntime, type CubeRuntime } from '../core/runtime.js'
export type * from './register.js'

export async function initializeEditor(runtime: CubeRuntime): Promise<typeof import('./register.js')> {
    initializeRuntime(runtime)
    const category = await import('./register.js')
    category.registerEditor()
    return category
}

export default initializeEditor
