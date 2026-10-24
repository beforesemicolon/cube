import type { CubeRuntime } from './runtime.js'

interface BrowserRuntime {
    readonly WebComponent?: CubeRuntime['WebComponent']
    readonly MARKUP?: Omit<CubeRuntime, 'WebComponent' | 'css'>
    readonly css?: CubeRuntime['css']
}

/** Classic scripts receive the existing runtime; they never import another copy. */
export function browserRuntime(): CubeRuntime {
    const browser = globalThis as typeof globalThis & { BFS?: BrowserRuntime }
    const runtime = browser.BFS
    if (!runtime?.WebComponent || !runtime.MARKUP?.html || !runtime.css) {
        throw new Error('Load @beforesemicolon/web-component/dist/client.js before a Cube client script.')
    }
    return { ...runtime.MARKUP, WebComponent: runtime.WebComponent, css: runtime.css }
}
