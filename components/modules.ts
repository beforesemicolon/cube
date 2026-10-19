import { categories, type Category, type CubeRuntime } from './initialize.js'
import { currentRuntime } from './core/runtime.js'

/** Module applications may use the installed engine or pass an existing runtime explicitly. */
export async function loadCategory(category: Category, runtime?: CubeRuntime): Promise<void> {
    if (typeof customElements === 'undefined') throw new Error('Cube category loading requires a DOM')
    const engine = runtime ?? currentRuntime() ?? await import('@beforesemicolon/web-component')
    await categories[category](engine)
}
